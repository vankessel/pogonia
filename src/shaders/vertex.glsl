#version 300 es

layout (location = 0) in vec4 a_position;
layout (location = 1) in vec3 i_normal;

uniform mat4 u_modelToWorld;
uniform mat4 u_worldToView;
uniform mat4 u_viewToClip;

void main() {
    gl_Position = u_viewToClip * u_worldToView * u_modelToWorld * a_position;
}