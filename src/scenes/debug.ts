import Scene, { Drawer } from '../scene';
import * as glu from '../utils/webglUtils';
import vertexShaderSource from '../shaders/vertex.glsl';
import frgmntShaderSource from '../shaders/frgmnt.glsl';
import skyboxVertexShaderSource from '../shaders/skybox/vertex.glsl';
import skyboxFrgmntShaderSource from '../shaders/skybox/frgmnt.glsl';
import Camera, { initStandardCameraController } from '../camera';
import { Cube } from '../primitives';
import RenderUtils from '../utils/renderUtils';
import skyboxRightSrc from '../../assets/skybox/right.jpg';
import skyboxLeftSrc from '../../assets/skybox/left.jpg';
import skyboxTopSrc from '../../assets/skybox/top.jpg';
import skyboxBottomSrc from '../../assets/skybox/bottom.jpg';
import skyboxBackSrc from '../../assets/skybox/back.jpg';
import skyboxFrontSrc from '../../assets/skybox/front.jpg';

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
        gl,
        Math.PI / 2,
        viewportInfo.width / viewportInfo.height,
        0.1,
        32,
    );
    camera.translate(0, 0, 2);
    const cameraController = initStandardCameraController(gl, camera);

    const cube = new Cube(gl);
    cube.scaleUniform(0.25);
    const drawFunction = RenderUtils.drawFunction(camera, mainProgram, [1, 0, 0, 1]);
    const cubeDrawer = new Drawer(cube, drawFunction);

    const skybox = new Cube(gl);
    const skyboxDrawFunction = RenderUtils.drawSkyboxFunction(camera, skyboxProgram);
    const skyboxDrawer = new Drawer(skybox, skyboxDrawFunction);
    const scene = new Scene(
        camera,
        [
            cameraController,
        ],
        [
            cubeDrawer,
            skyboxDrawer,
        ],
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
    skyboxRight.addEventListener('load', () => {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxRight);
    });
    const skyboxLeft = new Image();
    skyboxLeft.src = skyboxLeftSrc;
    skyboxLeft.addEventListener('load', () => {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxLeft);
    });
    const skyboxTop = new Image();
    skyboxTop.src = skyboxTopSrc;
    skyboxTop.addEventListener('load', () => {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxTop);
    });
    const skyboxBottom = new Image();
    skyboxBottom.src = skyboxBottomSrc;
    skyboxBottom.addEventListener('load', () => {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxBottom);
    });
    const skyboxBack = new Image();
    skyboxBack.src = skyboxBackSrc;
    skyboxBack.addEventListener('load', () => {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxBack);
    });
    const skyboxFront = new Image();
    skyboxFront.src = skyboxFrontSrc;
    skyboxFront.addEventListener('load', () => {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyboxFront);
    });

    return scene;
}
