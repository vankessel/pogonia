#version 300 es

precision mediump float;
precision mediump sampler2D;
precision mediump sampler2DArray;

in vec2 v_texCoord;

uniform sampler2D u_tex;
uniform sampler2DArray u_kernel;
uniform int u_features;
// TODO: u_features is redundant if we go with uniform arrays due to constant size.
//       Could possibly generate the shader code at runtime to allow variable feature size.
// TODO: Implement batch normalization
//uniform float weight[64];
//uniform float bias[64];
//uniform float sd[64];
//uniform float mean[64];

out vec4 o_color;

float debug = 2.0 / 1.0;

float pixelDist = 1.0 / 256.0;
float kernelDist = 1.0 / 7.0;

void main() {
    vec2 kernelCoord = vec2(v_texCoord.x, 1.0 - v_texCoord.y);
    float sum = 0.0;
    for (int feature = 0; feature < u_features; feature++) {
        for (float x = 0.0; x < 7.0; x++) {
            for (float y = 0.0; y < 7.0; y++) {
                // Kernel is upside down
                // Pytorch kernel origin is top-left
                // OpenGL texture origin is bottom-left
                sum += dot(
                    texture(
                        u_tex,
                        kernelCoord + vec2(-3.0 + x, -3.0 + y) * pixelDist
                    ),
                    texture(
                        u_kernel,
                        vec3(vec2(0.5 + x, 6.5 - y) * kernelDist, feature)
                    )
                );
            }
        }
    }
    // TODO: Batch normalization https://pytorch.org/docs/stable/nn.html#batchnorm2d
    // Example visual of first conv layer
//    o_color = vec4(max(vec3(0.0, 0.0, 0.0), vec3(sum, sum, sum)) * debug, 1.0);
    // No post processing
    o_color = texture(u_tex, v_texCoord);
    // Show kernel
//    o_color = vec4(texture(u_kernel, vec3(kernelCoord, 0)).xyz, 1.0);
    // Show kernel coords
//    o_color = vec4(kernelCoord.x, kernelCoord.y, 0.0, 1.0);
}
