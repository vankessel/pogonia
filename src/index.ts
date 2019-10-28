import * as glu from './webglUtils';
import Scene from './scene';
import {initInputState, InputState} from './input';
import initScene from "./scenes/cityscape";

function update(deltaTime: number, input: InputState, scene: Scene): void {

    for (const updatable of scene.updatables) {
        updatable.update(deltaTime, input);
    }
}

function draw(deltaTime: number, gl: WebGL2RenderingContext, scene: Scene): void {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (const drawable of scene.drawables) {
        drawable.draw(gl);
    }
}

function startRenderLoop(gl: WebGL2RenderingContext, scene: Scene, inputState: InputState): void {
    let lastMilliseconds = performance.now();

    function renderLoop(milliseconds: number): void {
        const deltaTime = (milliseconds - lastMilliseconds) * 0.001;

        inputState.mouse.movement.x = inputState.mouse.position.x - inputState.mouse.lastPosition.x;
        inputState.mouse.movement.y = inputState.mouse.position.y - inputState.mouse.lastPosition.y;
        update(deltaTime, inputState, scene);
        draw(deltaTime, gl, scene);
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

    // Set up resizing
    glu.resizeCanvas(gl);
    new window.ResizeObserver(function (): void {
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

document.addEventListener('DOMContentLoaded', function () {
    main();
});