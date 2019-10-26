#version 300 es

layout (location = 0) in vec4 a_position;

uniform mat4 u_worldToView;
uniform mat4 u_viewToClip;

out vec3 v_texCoord;

void main()
{
    v_texCoord = a_position.xyz;

    vec4 clipSpace = u_viewToClip * u_worldToView * a_position;
    gl_Position = clipSpace.xyww;
}