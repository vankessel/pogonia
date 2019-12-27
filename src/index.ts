import * as glu from './utils/glUtils';
import { initInputState, InputState } from './input';
import initScene from './scenes/cityscape';
import Scene from './scene';

function update(deltaTime: number, scene: Scene, input: InputState): void {
    for (const updatable of scene.updatables) {
        updatable.update(deltaTime, input);
    }
}

function draw(gl: WebGL2RenderingContext, deltaTime: number, scene: Scene): void {
    for (const renderable of scene.renderables) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, renderable.framebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for (const drawable of renderable.drawables) {
            drawable.draw(gl);
        }
    }
}

function startRenderLoop(gl: WebGL2RenderingContext, scene: Scene, inputState: InputState): void {
    let lastMilliseconds = performance.now();

    function renderLoop(milliseconds: number): void {
        const deltaTime = (milliseconds - lastMilliseconds) * 0.001;

        inputState.mouse.movement.x = inputState.mouse.position.x - inputState.mouse.lastPosition.x;
        inputState.mouse.movement.y = inputState.mouse.position.y - inputState.mouse.lastPosition.y;
        update(deltaTime, scene, inputState);
        draw(gl, deltaTime, scene);
        inputState.mouse.lastPosition.x = inputState.mouse.position.x;
        inputState.mouse.lastPosition.y = inputState.mouse.position.y;

        lastMilliseconds = milliseconds;
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
}

function main(): void {
    // Set up context
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.focus();
    const inputState = initInputState(canvas);
    const gl = glu.getContext(canvas);
    gl.getExtension('EXT_color_buffer_float');

    // Set up resizing
    glu.resizeCanvas(gl);
    new window.ResizeObserver((): void => {
        glu.resizeCanvas(gl);
    }).observe(canvas);

    // Enable culling and depth testing
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0, 0, 0, 1);

    const scene = initScene(gl);
    startRenderLoop(gl, scene, inputState);
}

document.addEventListener('DOMContentLoaded', () => {
    main();
});
