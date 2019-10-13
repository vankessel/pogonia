#version 300 es

layout (location = 0) in vec4 a_position;

uniform mat4 u_worldToView;
uniform mat4 u_projection;

out vec3 v_texCoord;

void main()
{
    v_texCoord = a_position.xyz;

    mat4 stationaryWorldToView = u_worldToView;
    stationaryWorldToView[3][0] = 0.0;
    stationaryWorldToView[3][1] = 0.0;
    stationaryWorldToView[3][2] = 0.0;

    gl_Position = u_projection * stationaryWorldToView * a_position;
}