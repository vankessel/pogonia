#version 300 es

precision mediump float;

in vec3 v_normal;

uniform vec4 u_color;

out vec4 o_color;

vec3 lightDir = normalize(vec3(3, -1, 4));

void main() {
//    o_color = vec4(v_normal/2.0+0.5, 1.0);
    float intensity = -dot(v_normal, lightDir) / 6.0 + 5.0 / 6.0;
    o_color = u_color * vec4(intensity, intensity, intensity, 1.0);
}