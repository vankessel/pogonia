# pogonia

A game library for creating interactive scenes in WebGL.

Here's a live demo:

https://vankessel.io/pogonia/

No longer being developed, may come back to it one day to finish it and upgrade it to WebGPU.

Remaining work involves mapping the trained PyTorch model to a shader. Need to figure out if convolution is implemented as cross-correlation due to learned parameters, and how each kernel is oriented in relation to the image. (E.x. row-major or column-major data?)

[This scene](https://vankessel.io/pogonia/) doesn't use textures because it was made with the intent of applying a neural network trained with the cityscapes dataset as a shader, but Nvidia beat me to it:

https://youtu.be/22Sojtv4gbg
