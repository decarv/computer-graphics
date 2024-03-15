#version 300 es

// aPosition é um buffer de entrada
in vec3 a_position; // vec4?
in vec4 a_color;
in vec3 a_normal;

// uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_perspective;
uniform mat4 u_inverse_transpose;

uniform vec4 u_ambient_light;

uniform vec4 u_diffuse_light;
uniform vec4 u_light_position;

out vec4 Ia;
out vec4 v_diffuse_color;
out vec3 v_normal;
out vec3 v_light;
out vec3 v_view;

void main() {
    gl_Position = u_perspective * u_view * vec4(a_position, 1);
    v_normal = mat3(u_inverse_transpose) * a_normal;
    vec4 pos = u_view * vec4(a_position, 1);
    v_light = (u_view * u_light_position - pos).xyz;
    v_view = -(pos.xyz);
    v_diffuse_color = u_diffuse_light * a_color;
    Ia = u_ambient_light * a_color;
}