struct VSOut {
    @builtin(position) pos: vec4<f32>,
    @location(0) uv: vec2<f32>
};

@vertex
fn vsMain(@builtin(vertex_index) idx: u32) -> VSOut {
    var pos = array<vec2<f32>, 4>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>(-1.0,  1.0),
        vec2<f32>( 1.0,  1.0)
    );
    var uv = array<vec2<f32>, 4>(
        vec2<f32>(0.0, 1.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(0.0, 0.0),
        vec2<f32>(1.0, 0.0)
    );

    var out: VSOut;
    out.pos = vec4<f32>(pos[idx], 0.9999, 1.0); // Very back
    out.uv = uv[idx];
    return out;
}

@group(0) @binding(1) var samp: sampler;
@group(0) @binding(3) var videoTex: texture_2d<f32>;

@fragment
fn fsMain(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    let color = textureSample(videoTex, samp, uv).rgb;
    // Add subtle tint to confirm it's drawing even if video is black
    return vec4<f32>(color + vec3<f32>(0.02, 0.0, 0.04), 1.0);
}
