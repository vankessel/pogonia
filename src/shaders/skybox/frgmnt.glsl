#version 300 es

precision mediump float;

in vec3 v_texCoord;

uniform samplerCube u_skybox;

out vec4 o_color;

void main()
{
    o_color = texture(u_skybox, v_texCoord);
}