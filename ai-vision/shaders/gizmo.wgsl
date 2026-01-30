struct Uniforms {
    viewProj: mat4x4<f32>,
    p1: vec4<f32>,
    p2: vec4<f32>,
};

@group(0) @binding(0) var<uniform> u: Uniforms;

struct VSOut {
    @builtin(position) pos: vec4<f32>,
    @location(0) color: vec3<f32>
};

@vertex
fn vsMain(@builtin(vertex_index) idx: u32) -> VSOut {
    // ViewCube axes (shorter for corner display)
    var positions = array<vec3<f32>, 6>(
        vec3<f32>(0.0, 0.0, 0.0), vec3<f32>(0.8, 0.0, 0.0),  // X axis (red)
        vec3<f32>(0.0, 0.0, 0.0), vec3<f32>(0.0, 0.8, 0.0),  // Y axis (green)
        vec3<f32>(0.0, 0.0, 0.0), vec3<f32>(0.0, 0.0, 0.8)   // Z axis (blue)
    );

    var colors = array<vec3<f32>, 6>(
        vec3<f32>(1.0, 0.1, 0.1), vec3<f32>(1.0, 0.1, 0.1),  // Red
        vec3<f32>(0.1, 1.0, 0.1), vec3<f32>(0.1, 1.0, 0.1),  // Green
        vec3<f32>(0.1, 0.5, 1.0), vec3<f32>(0.1, 0.5, 1.0)   // Blue
    );

    // Extract rotation-only from viewProj (top-left 3x3)
    let rot = mat3x3<f32>(
        u.viewProj[0].xyz,
        u.viewProj[1].xyz,
        u.viewProj[2].xyz
    );

    let rotated = rot * positions[idx];

    // Position in top-right corner of screen (NDC coords)
    let scale = 0.12;  // Size of ViewCube
    let offset = vec2<f32>(0.85, 0.73);  // Slightly lowered from 0.85

    var out: VSOut;
    out.pos = vec4<f32>(offset + rotated.xy * scale, 0.0, 1.0);
    out.color = colors[idx];
    return out;
}

@fragment
fn fsMain(@location(0) color: vec3<f32>) -> @location(0) vec4<f32> {
    return vec4<f32>(color, 1.0);
}
