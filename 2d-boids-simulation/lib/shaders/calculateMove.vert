#version 300 es

/* refs.:
    https://webgl2fundamentals.org/webgl/lessons/webgl-2d-rotation.html
*/

in vec2 a_position;
in vec4 a_color;

out vec2 v_position; // novas posições
out vec4 v_color;
uniform vec2 u_resolution;
uniform float u_delta_time;
uniform float u_angle;
uniform vec2 u_velocity;
uniform vec2 u_translation;
uniform vec2 u_rotation;
uniform vec2 u_center;

const float PI = 3.1415926535897932384626433832795;

float calculate_angle(vec2 u, vec2 v) {
    float cosine = clamp(dot(normalize(u), normalize(v)), -1.0, 1.0);
    return acos(cosine);
}

void main() {
    vec2 position = a_position - u_center;

    // why -abs?
    // translation
    position = position + u_velocity * u_delta_time;
    v_position = position;
}