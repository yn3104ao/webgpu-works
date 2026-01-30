// Minimal test shader - no matrices, just NDC coordinates

struct VSOut {
    @builtin(position) pos: vec4<f32>,
    @location(0) color: vec3<f32>
};

@vertex
fn vsMain(@builtin(vertex_index) idx: u32) -> VSOut {
    // Hardcoded triangle in NDC space (center of screen)
    var positions = array<vec2<f32>, 3>(
        vec2<f32>( 0.0,  0.5),  // Top
        vec2<f32>(-0.5, -0.5),  // Bottom left
        vec2<f32>( 0.5, -0.5)   // Bottom right
    );

    var out: VSOut;
    out.pos = vec4<f32>(positions[idx], 0.0, 1.0);  // NDC coords directly
    out.color = vec3<f32>(1.0, 0.0, 1.0);  // Magenta
    return out;
}

@fragment
fn fsMain(@location(0) color: vec3<f32>) -> @location(0) vec4<f32> {
    return vec4<f32>(color, 1.0);
}
