#version 300 es

precision mediump float;
precision lowp sampler2DArray;

in vec2 v_texCoord;

uniform sampler2D u_tex;
uniform sampler2DArray u_kernel;

out vec4 o_color;

float debug = 1.0 / 147.0;

float pixelDist = 1.0 / 256.0;
float kernelDist = 1.0 / 7.0;
vec2 kernelBotLeft = vec2(0.5, 0.5) / 7.0;

void main() {
    float sum = 0.0;
//    for (int feature = 0; feature < 64; feature++) {
    int feature = 0;
    for (float x = 0.0; x < 7.0; x++) {
        for (float y = 0.0; y < 7.0; y++) {
            // TODO: Is kernel upside down? In what order is data loaded?
            sum += dot(texture(u_tex, v_texCoord + vec2(-3.0 + x, -3.0 + y) * pixelDist), texture(u_kernel, vec3((0.5 + x) * kernelDist, (0.5 + y) * kernelDist, feature)));
        }
    }
//    }
    // TODO: Batch normalization https://pytorch.org/docs/stable/nn.html#batchnorm2d
    // The last layer of the kernel is the bias
    o_color = vec4(max(vec3(0.0, 0.0, 0.0), vec3(sum, sum, sum)) * debug, 1.0);
}
