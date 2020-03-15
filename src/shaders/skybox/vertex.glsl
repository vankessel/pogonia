#version 300 es

layout (location = 0) in vec4 a_position;

uniform mat4 u_worldToView;
uniform mat4 u_viewToClip;

out vec3 v_texCoord;

mat4 negate = mat4(-1);

void main()
{
    // Flip the skybox inside out so the front face points inward and doesn't get culled.
    vec4 a_position = negate * a_position;
    vec4 clipSpace = u_viewToClip * u_worldToView * a_position;

    v_texCoord = a_position.xyz;
    gl_Position = clipSpace.xyww;
}
