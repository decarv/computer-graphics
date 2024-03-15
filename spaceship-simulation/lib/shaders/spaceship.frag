#version 300 es

precision highp float;

in vec3 v_normal;
in vec3 v_light;
in vec3 v_view;
in vec4 Ia;
in vec4 v_diffuse_color;

in vec4 u_ambient_color;
uniform vec4 u_specular_color;
uniform float u_specular_alpha;

out vec4 out_color;

void main() {
    vec3 normal_vec = normalize(v_normal);
    vec3 light_vec = normalize(v_light);
    vec3 view_vec = normalize(v_view);
    vec3 half_vec = normalize(light_vec + view_vec);

    float cos_d = max(0.0, dot(normal_vec, light_vec));
    vec4 Id = cos_d * v_diffuse_color;

    float cos_s = pow(max(0.0, dot(normal_vec, half_vec)), u_specular_alpha);
    vec4 Is = vec4(0.0, 0.0, 0.0, 1);
    if (cos_s > 0.0) {
        Is = cos_s * u_specular_color;
    }

    out_color = Ia + Id + Is;
}