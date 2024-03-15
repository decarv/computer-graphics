#version 300 es

in vec3 a_ls_position;
uniform mat4 u_ls_view;
uniform mat4 u_ls_perspective;

void main() {
    gl_Position = u_ls_perspective * u_ls_view * vec4(a_ls_position, 1.0);
}
