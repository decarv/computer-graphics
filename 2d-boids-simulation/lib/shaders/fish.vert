#version 300 es

/* refs.:
    https://webgl2fundamentals.org/webgl/lessons/webgl-2d-rotation.html
*/

in vec2 a_position;
in vec4 a_color;
out vec4 v_color;
uniform vec2 u_resolution;

void main() {
    vec2 zero_to_one = a_position / u_resolution;
    vec2 zero_to_two = zero_to_one * 2.0;
    vec2 clip_space = zero_to_two - 1.0;
    gl_Position = vec4(clip_space * vec2(1, -1), 0, 1);
    v_color = a_color;
}
