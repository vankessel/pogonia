import {BigF, Cube, Skybox} from './primitives'
import * as glu from './webglUtils';
import vertexShaderSource from './shaders/vertex.glsl';
import frgmntShaderSource from './shaders/frgmnt.glsl';
import skyboxVertexShaderSource from './shaders/skybox/vertex.glsl';
import skyboxFrgmntShaderSource from './shaders/skybox/frgmnt.glsl';
import Camera, {ControllableCamera} from './camera';
import Renderer from './renderer';
import Scene from "./scene";
import {World} from "./constants";
import {initInputState, InputState} from "./input";

function update(deltaTime: number, scene: Scene, input: InputState): void {
    scene.activeCamera.update(deltaTime, input);
}

function draw(deltaTime: number, gl: WebGL2RenderingContext, scene: Scene): void {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    Renderer.draw(gl, scene.activeCamera, scene.drawables[1].shape, scene.drawables[1].program);
    Renderer.draw(gl, scene.activeCamera, scene.drawables[2].shape, scene.drawables[2].program);
    Renderer.drawSkybox(gl, scene.activeCamera, scene.drawables[0].shape, scene.drawables[0].program);
}

function startRenderLoop(gl: WebGL2RenderingContext, scene: Scene, inputState: InputState): void {
    let lastMilliseconds = performance.now();
    scene.activeCamera.rotateAxis(Math.PI / 8, World.UP);

    function renderLoop(milliseconds: number): void {
        const deltaTime = (milliseconds - lastMilliseconds) * 0.001;

        update(deltaTime, scene, inputState);
        draw(deltaTime, gl, scene);

        lastMilliseconds = milliseconds;
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
}

function initScene(gl: WebGL2RenderingContext): Scene {

    const camera = new ControllableCamera(Math.PI / 2, 4 / 3, 0.1, 32);
    camera.translate([0, 0, 2]);

    const skybox = new Skybox();
    const bigf = new BigF();
    const cube = new Cube();
    cube.scale(0.25);

    bigf.translate([1, 1, -0.5]);
    bigf.rotateZ(Math.PI / 4);
    // Create program
    const mainProgram = glu.createProgramFromSource(gl, vertexShaderSource, frgmntShaderSource);

    // Create skybox program
    const skyboxProgram = glu.createProgramFromSource(gl, skyboxVertexShaderSource, skyboxFrgmntShaderSource);
    const skyboxLoc = gl.getUniformLocation(skyboxProgram, 'u_skybox');
    gl.uniform1i(skyboxLoc, 0);

    const scene = new Scene(camera, [
        {
            program: skyboxProgram,
            shape: skybox
        },
        {
            program: mainProgram,
            shape: bigf
        },
        {
            program: mainProgram,
            shape: cube
        }
    ]);

    // SKYBOX
    const skyboxTexture = glu.createTexture(gl);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, 1, 1, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])); // RIGHT
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, 1, 1, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 255, 0, 255])); // LEFT
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, 1, 1, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255])); // UP
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, 1, 1, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 0, 255])); // DOWN
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, 1, 1, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255])); // BACK
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, 1, 1, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255])); // FRONT

    const skyboxRight = new Image();
    skyboxRight.src = '/assets/skybox/right.jpg';
    // skyboxRight.src = '/assets/skybox/hw_mystic/mystic_rt.jpg';
    skyboxRight.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxRight);
    });
    const skyboxLeft = new Image();
    skyboxLeft.src = '/assets/skybox/left.jpg';
    // skyboxLeft.src = '/assets/skybox/hw_mystic/mystic_lf.jpg';
    skyboxLeft.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxLeft);
    });
    const skyboxTop = new Image();
    skyboxTop.src = '/assets/skybox/top.jpg';
    // skyboxTop.src = '/assets/skybox/hw_mystic/mystic_up.jpg';
    skyboxTop.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxTop);
    });
    const skyboxBottom = new Image();
    skyboxBottom.src = '/assets/skybox/bottom.jpg';
    // skyboxBottom.src = '/assets/skybox/hw_mystic/mystic_dn.jpg';
    skyboxBottom.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxBottom);
    });
    const skyboxBack = new Image();
    skyboxBack.src = '/assets/skybox/back.jpg';
    // skyboxBack.src = '/assets/skybox/hw_mystic/mystic_bk.jpg';
    skyboxBack.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxBack);
    });
    const skyboxFront = new Image();
    skyboxFront.src = '/assets/skybox/front.jpg';
    // skyboxFront.src = '/assets/skybox/hw_mystic/mystic_ft.jpg';
    skyboxFront.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxFront);
    });

    return scene;
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