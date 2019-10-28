import Scene, {Drawer, Updater} from "../scene";
import * as glu from "../webglUtils";
import vertexShaderSource from "../shaders/vertex.glsl";
import frgmntShaderSource from "../shaders/frgmnt.glsl";
import skyboxVertexShaderSource from "../shaders/skybox/vertex.glsl";
import skyboxFrgmntShaderSource from "../shaders/skybox/frgmnt.glsl";
import Camera from "../camera";
import {InputState} from "../input";
import {mat4} from "gl-matrix";
import {World} from "../constants";
import {BigF, Cube, Skybox} from "../primitives";
import RenderUtil from "../renderUtil";
import skyboxRightSrc from "../../assets/skybox/right.jpg";
import skyboxLeftSrc from "../../assets/skybox/left.jpg";
import skyboxTopSrc from "../../assets/skybox/top.jpg";
import skyboxBottomSrc from "../../assets/skybox/bottom.jpg";
import skyboxBackSrc from "../../assets/skybox/back.jpg";
import skyboxFrontSrc from "../../assets/skybox/front.jpg";

export default function initScene(gl: WebGL2RenderingContext): Scene {
    // Create program
    const mainProgram = glu.createProgramFromSource(gl, vertexShaderSource, frgmntShaderSource);

    // Create skybox program
    const skyboxProgram = glu.createProgramFromSource(gl, skyboxVertexShaderSource, skyboxFrgmntShaderSource);
    // Go ahead and bind the first texture unit as that's where we'll bind the cubemap
    const skyboxLoc = gl.getUniformLocation(skyboxProgram, 'u_skybox');
    gl.uniform1i(skyboxLoc, 0);

    const viewportInfo = glu.getViewportInfo(gl);
    const camera = new Camera(
        Math.PI / 2,
        viewportInfo.width / viewportInfo.height,
        0.1,
        32
    );
    camera.translate([0, 0, 2]);
    const cameraController = new Updater(camera, function (camera: Camera, deltaTime: number, input: InputState): void {
        let cameraDeltaX = 0;
        let cameraDeltaY = 0;
        if (input.mouse.pressed && input.mouse.button === 0) {
            cameraDeltaX = input.mouse.movement.x;
            cameraDeltaY = input.mouse.movement.y;
        }
        camera.rotateX(-cameraDeltaY * deltaTime);
        // Rotate camera at its position relative to world up axis
        const tx = camera.transform[12];
        const ty = camera.transform[13];
        const tz = camera.transform[14];
        camera.transform[12] = 0;
        camera.transform[13] = 0;
        camera.transform[14] = 0;
        const rotMat = mat4.fromRotation(mat4.create(), -cameraDeltaX * deltaTime, World.UP);
        mat4.multiply(camera.transform, rotMat, camera.transform);
        camera.transform[12] = tx;
        camera.transform[13] = ty;
        camera.transform[14] = tz;

        if (input.keys.w) {
            camera.translate([0, 0, -deltaTime]);
        }
        if (input.keys.a) {
            camera.translate([-deltaTime, 0, 0]);
        }
        if (input.keys.s) {
            camera.translate([0, 0, deltaTime]);
        }
        if (input.keys.d) {
            camera.translate([deltaTime, 0, 0]);
        }
    });

    const cube = new Cube();
    cube.scale(0.25);
    const drawFunction = RenderUtil.drawFunction(camera, mainProgram, [1, 0, 0, 1]);
    const cubeDrawer = new Drawer(cube, drawFunction);

    const bigf = new BigF();
    bigf.translate([1, 1, -0.5]);
    bigf.rotateZ(Math.PI / 4);
    const bigfDrawer = new Drawer(bigf, drawFunction);

    const skybox = new Skybox();
    const skyboxDrawFunction = RenderUtil.drawSkyboxFunction(camera, skyboxProgram);
    const skyboxDrawer = new Drawer(skybox, skyboxDrawFunction);
    const scene = new Scene(
        camera,
        [
            cameraController
        ],
        [
            cubeDrawer,
            bigfDrawer,
            skyboxDrawer
        ]
    );

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
    skyboxRight.src = skyboxRightSrc;
    skyboxRight.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxRight);
    });
    const skyboxLeft = new Image();
    skyboxLeft.src = skyboxLeftSrc;
    skyboxLeft.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxLeft);
    });
    const skyboxTop = new Image();
    skyboxTop.src = skyboxTopSrc;
    skyboxTop.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxTop);
    });
    const skyboxBottom = new Image();
    skyboxBottom.src = skyboxBottomSrc;
    skyboxBottom.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxBottom);
    });
    const skyboxBack = new Image();
    skyboxBack.src = skyboxBackSrc;
    skyboxBack.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxBack);
    });
    const skyboxFront = new Image();
    skyboxFront.src = skyboxFrontSrc;
    skyboxFront.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxFront);
    });

    return scene;
}