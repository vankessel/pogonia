import * as glu from './utils/glUtils';
import { initInputState, InputState } from './input';
import initScene from './scenes/cityscape';
import Scene from './scene';

function startRenderLoop(gl: WebGL2RenderingContext, scene: Scene, inputState: InputState): void {
    let lastMilliseconds = performance.now();

    function renderLoop(milliseconds: number): void {
        const deltaTime = (milliseconds - lastMilliseconds) * 0.001;

        inputState.mouse.movement.x = inputState.mouse.position.x - inputState.mouse.lastPosition.x;
        inputState.mouse.movement.y = inputState.mouse.position.y - inputState.mouse.lastPosition.y;
        scene.update(deltaTime, inputState);
        scene.draw(gl);
        inputState.mouse.lastPosition.x = inputState.mouse.position.x;
        inputState.mouse.lastPosition.y = inputState.mouse.position.y;

        lastMilliseconds = milliseconds;
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
}

function main(): void {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    // Focus canvas initially and on mouse enter
    canvas.focus();
    canvas.addEventListener('mouseenter', () => {
        canvas.focus();
    });

    // Prepare the input state and event handlers
    const inputState = initInputState(canvas);

    // Set up context
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

    // TODO: Support switching between scenes
    // The following scenario could fail because the second line will initialize a different gl state.
    //
    // const scene1 = scene1.initScene(gl);
    // const scene2 = scene2.initScene(gl);
    // startRenderLoop(gl, scene1, inputState);
    //
    const scene = initScene(gl);
    startRenderLoop(gl, scene, inputState);
}

document.addEventListener('DOMContentLoaded', () => {
    main();
});
