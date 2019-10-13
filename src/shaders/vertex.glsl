#version 300 es

layout (location = 0) in vec4 a_position;

uniform mat4 u_modelToWorld;
uniform mat4 u_worldToView;
uniform mat4 u_projection;

void main() {
    gl_Position = u_projection * u_worldToView * u_modelToWorld * a_position;
}