#version 300 es

layout (location = 0) in vec4 a_position;

out vec2 v_texCoord;

void main() {
    v_texCoord = (a_position.xy + 1.0) / 2.0;
    gl_Position = vec4(a_position.xy, 1.0, 1.0);
}
