
struct Uniforms {
    viewProj: mat4x4<f32>,
    p1: vec4<f32>, // x:ptSize, y:dispScale, z:useVideo, w:width
    p2: vec4<f32>, // x:height, others unused
};

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(4) var<storage, read> points: array<f32>;

struct VSOut {
    @builtin(position) pos: vec4<f32>,
    @location(0) color: vec3<f32>,
    @location(1) uv: vec2<f32> // Local quad UV (-1 to 1)
};

@vertex
fn vsMain(@builtin(vertex_index) vertexIdx: u32) -> VSOut {
    let pointIdx = vertexIdx / 6u;
    let cornerIdx = vertexIdx % 6u;

    let offset = pointIdx * 6u;
    let pos = vec3<f32>(points[offset+0u], points[offset+1u], points[offset+2u]);

    // Check if point should be rendered (strided sampling skip)
    if (pos.z == 0.0) {
        return VSOut(vec4<f32>(0.0, 0.0, 0.0, 0.0), vec3<f32>(0.0), vec2<f32>(0.0));
    }
    let col = vec3<f32>(points[offset+3u], points[offset+4u], points[offset+5u]);

    let centerClip = u.viewProj * vec4<f32>(pos, 1.0);

    // Normalized device coordinates (-1 to 1) for the quad corners
    var quadUV: vec2<f32>;
    if (cornerIdx == 0u) { quadUV = vec2<f32>(-1.0, -1.0); }
    else if (cornerIdx == 1u) { quadUV = vec2<f32>(1.0, -1.0); }
    else if (cornerIdx == 2u) { quadUV = vec2<f32>(-1.0, 1.0); }
    else if (cornerIdx == 3u) { quadUV = vec2<f32>(-1.0, 1.0); }
    else if (cornerIdx == 4u) { quadUV = vec2<f32>(1.0, -1.0); }
    else { quadUV = vec2<f32>(1.0, 1.0); }

    let pointSize = u.p1.x * 0.02; // Visual point size

    var out: VSOut;
    // Apply billboard offset in clip space (after projection) to keep it facing camera
    out.pos = vec4<f32>(centerClip.xy + quadUV * pointSize * centerClip.w, centerClip.z, centerClip.w);
    out.color = col;
    out.uv = quadUV;
    return out;
}

@fragment
fn fsMain(@location(0) color: vec3<f32>, @location(1) uv: vec2<f32>) -> @location(0) vec4<f32> {
    // Circle/Sphere masking
    let distSq = dot(uv, uv);
    if (distSq > 1.0) { discard; }

    // Simple sphere shading (Fake lighting/depth)
    let normalZ = sqrt(1.0 - distSq);
    let diffuse = max(0.2, normalZ); // Simple N dot L (where L is camera direction)

    let finalColor = color * diffuse + vec3<f32>(0.1 * normalZ); // Add subtle spec highlight
    return vec4<f32>(finalColor, 1.0);
}
