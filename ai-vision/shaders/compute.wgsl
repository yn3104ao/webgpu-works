struct Uniforms {
    viewProj: mat4x4<f32>,
    p1: vec4<f32>, // x:ptSize, y:dispScale, z:useVideo, w:vidW
    p2: vec4<f32>, // x:vidH, y:depthW, z:depthH, w:isDense
    p3: vec4<f32>, // x:doIsolate, y:bgClip, z:unused, w:unused
};

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var depthTex: texture_2d<f32>;
@group(0) @binding(3) var videoTex: texture_2d<f32>;
@group(0) @binding(4) var<storage, read_write> points: array<f32>;
@group(0) @binding(5) var maskTex: texture_2d<f32>;

@compute @workgroup_size(8, 8)
fn computeMain(@builtin(global_invocation_id) id: vec3<u32>) {
    let w = u32(u.p1.w); // Video Width (1280)
    let h = u32(u.p2.x); // Video Height (720)
    if (id.x >= w || id.y >= h) { return; }

    let idx = id.y * w + id.x;
    let offset = idx * 6u;

    // DYNAMIC STRIDE: isDense (u.p2.w) > 0.5 means Full Density (RTX Mode)
    let isDense = u.p2.w > 0.5;
    if (!isDense && (id.x % 2u != 0u || id.y % 2u != 0u)) {
        points[offset + 2u] = 0.0;
        return;
    }

    let uv = vec2<f32>(f32(id.x)/f32(w), f32(id.y)/f32(h));

    // MANUAL BILINEAR UPSCALING for unfilterable R32Float
    let dw = f32(u.p2.y);
    let dh = f32(u.p2.z);
    let d_coords = uv * vec2<f32>(dw - 1.0, dh - 1.0);
    let i_coords = vec2<i32>(floor(d_coords));
    let f_coords = fract(d_coords);

    let d00 = textureLoad(depthTex, i_coords + vec2<i32>(0, 0), 0).r;
    let d10 = textureLoad(depthTex, i_coords + vec2<i32>(1, 0), 0).r;
    let d01 = textureLoad(depthTex, i_coords + vec2<i32>(0, 1), 0).r;
    let d11 = textureLoad(depthTex, i_coords + vec2<i32>(1, 1), 0).r;

    let d_top = mix(d00, d10, f_coords.x);
    let d_bot = mix(d01, d11, f_coords.x);
    let d = mix(d_top, d_bot, f_coords.y);

    // AI SEMANTIC ISOLATION
    if (u.p3.x > 0.5) {
        let maskDims = textureDimensions(maskTex);
        var mask = 1.0;
        if (i_coords.x >= 0 && i_coords.y >= 0 && u32(i_coords.x) < maskDims.x && u32(i_coords.y) < maskDims.y) {
            mask = textureLoad(maskTex, i_coords, 0).r;
        }
        if (mask < 0.5) {
            points[offset + 2u] = 0.0;
            return;
        }
    }

    // DEPTH CLIPPING (Manual cleanup)
    if (d < u.p3.y * 0.01) {
        points[offset + 2u] = 0.0;
        return;
    }

    var c = vec3<f32>(0.5, 0.5, 0.5);
    if (u.p1.z > 0.5) {
        c = textureSampleLevel(videoTex, samp, uv, 0.0).rgb;
    }

    let scale = u.p1.y;
    let zPos = d * scale;
    let xPos = (uv.x - 0.5) * zPos * 2.5;
    let yPos = (0.5 - uv.y) * zPos * 2.5;

    points[offset + 0u] = xPos;
    points[offset + 1u] = yPos;
    points[offset + 2u] = zPos;
    points[offset + 3u] = c.r;
    points[offset + 4u] = c.g;
    points[offset + 5u] = c.b;
}
