#version 300 es

precision mediump float;

in vec2 v_texCoord;

uniform sampler2D u_tex;

out vec4 o_color;

void main() {
    o_color = vec4(1.0, 1.0, 1.0, 2.0) - texture(u_tex, v_texCoord);
}
