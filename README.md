# Pogonia

A WebGL game engine.

Created to test a neural network based shader. This game engine is extremely minimal as it only has a few goals it needs
to accomplish:

1. Render primitives with flat coloring.
2. Move the camera with user input.
3. Feed a convolutional neural network's parameters into shaders.

Why TypeScript and WebGL?
TypeScript is incredibly fast to prototype in and I plan on also using this as a learning aid in my blog.

## Running

`cd path/to/pogonia`

`npm link ../gl-transform`

`npm i`

`npm run serve`

Navigate to `localhost:8080`
