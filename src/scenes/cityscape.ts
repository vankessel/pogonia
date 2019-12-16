import { Vec4 } from 'gl-transform';
import Scene, { Drawer } from '../scene';
import * as glu from '../utils/webglUtils';
import vertexShaderSource from '../shaders/vertex.glsl';
import frgmntShaderSource from '../shaders/frgmnt.glsl';
import skyboxVertexShaderSource from '../shaders/skybox/vertex.glsl';
import skyboxFrgmntShaderSource from '../shaders/skybox/frgmnt.glsl';
import postVertexShaderSource from '../shaders/post/vertex.glsl';
import postFrgmntShaderSource from '../shaders/post/frgmnt.glsl';
import Camera, { initStandardCameraController } from '../camera';
import { Cube, Quad } from '../primitives';
import RenderUtils from '../utils/renderUtils';
import skyboxRightSrc from '../../assets/skybox/right.jpg';
import skyboxLeftSrc from '../../assets/skybox/left.jpg';
import skyboxTopSrc from '../../assets/skybox/top.jpg';
import skyboxBottomSrc from '../../assets/skybox/bottom.jpg';
import skyboxBackSrc from '../../assets/skybox/back.jpg';
import skyboxFrontSrc from '../../assets/skybox/front.jpg';

class LabelColors {
    static readonly ROAD = Vec4.from([128, 64, 128, 255].map((val) => val / 255));
    static readonly SIDEWALK = Vec4.from([244, 35, 232, 255].map((val) => val / 255));
    static readonly BUILDING = Vec4.from([70, 70, 70, 255].map((val) => val / 255));
    static readonly CAR = Vec4.from([0, 0, 142, 255].map((val) => val / 255));
    static readonly VEGETATION = Vec4.from([107, 142, 35, 255].map((val) => val / 255));
    static readonly SKY = Vec4.from([70, 130, 180, 255].map((val) => val / 255));
}

function generateBuildings(
    gl: WebGL2RenderingContext,
    buildingWidth: number,
    buildingHeight: number,
    spacing: number,
    numHor: number,
    numVert: number,
    camera: Camera,
    program: WebGLProgram,
): Drawer<Cube>[] {
    const drawRoadFunc = RenderUtils.drawFunction(camera, program, LabelColors.ROAD);
    const drawBuildingFunc = RenderUtils.drawFunction(camera, program, LabelColors.BUILDING);
    const drawSidewalkFunc = RenderUtils.drawFunction(camera, program, LabelColors.SIDEWALK);

    const buildingWidthD2 = buildingWidth / 2;
    const buildingSpacing = buildingWidth + spacing;
    const pos = { x: 0, z: 0 };
    const fullWidth = buildingSpacing * numHor - spacing;
    const fullHeight = buildingSpacing * numVert - spacing;
    const leftBound = -fullWidth / 2;
    const bottomBound = -fullHeight / 2;
    const shapes = [];

    // Road
    const roadPlane = new Cube(gl);
    roadPlane.scale(fullWidth * 16, 1, fullHeight * 16);
    roadPlane.translate(0, -0.5, 0);
    shapes.push(new Drawer(roadPlane, drawRoadFunc));

    // Buildings
    for (let col = 0; col < numHor; col++) {
        for (let row = 0; row < numVert; row++) {
            pos.x = leftBound + buildingWidthD2 + col * buildingSpacing;
            pos.z = bottomBound + buildingWidthD2 + row * buildingSpacing;
            const building = new Cube(gl);
            building.translate(pos.x, buildingHeight / 2, pos.z);
            building.scale(buildingWidth, buildingHeight, buildingWidth);
            shapes.push(new Drawer(building, drawBuildingFunc));
        }
    }

    const sidewalkWidth = 0.25;
    const sidewalkWidthD2 = sidewalkWidth / 2;
    const sidewalkWidthM2 = sidewalkWidth * 2;
    const sidewalkHeight = 0.05;
    // Sidewalks
    for (let col = 0; col < numHor; col++) {
        for (let row = 0; row < numVert; row++) {
            pos.x = leftBound + buildingWidthD2 + col * buildingSpacing;
            pos.z = bottomBound + buildingWidthD2 + row * buildingSpacing;
            let sx; let
                sz;
            // Pos x
            sx = pos.x + buildingWidthD2 + sidewalkWidthD2;
            sz = pos.z;
            const sidewalkNorth = new Cube(gl);
            sidewalkNorth.translate(sx, sidewalkHeight / 2, sz);
            sidewalkNorth.scale(sidewalkWidth, sidewalkHeight, buildingWidth + sidewalkWidthM2);
            shapes.push(new Drawer(sidewalkNorth, drawSidewalkFunc));
            // Neg x
            sx = pos.x - buildingWidthD2 - sidewalkWidthD2;
            sz = pos.z;
            const sidewalkSouth = new Cube(gl);
            sidewalkSouth.translate(sx, sidewalkHeight / 2, sz);
            sidewalkSouth.scale(sidewalkWidth, sidewalkHeight, buildingWidth + sidewalkWidthM2);
            shapes.push(new Drawer(sidewalkSouth, drawSidewalkFunc));
            // Pos z
            sx = pos.x;
            sz = pos.z + buildingWidthD2 + sidewalkWidthD2;
            const sidewalkEast = new Cube(gl);
            sidewalkEast.translate(sx, sidewalkHeight / 2, sz);
            sidewalkEast.scale(buildingWidth, sidewalkHeight, sidewalkWidth);
            shapes.push(new Drawer(sidewalkEast, drawSidewalkFunc));
            // Neg z
            sx = pos.x;
            sz = pos.z - buildingWidthD2 - sidewalkWidthD2;
            const sidewalkWest = new Cube(gl);
            sidewalkWest.translate(sx, sidewalkHeight / 2, sz);
            sidewalkWest.scale(buildingWidth, sidewalkHeight, sidewalkWidth);
            shapes.push(new Drawer(sidewalkWest, drawSidewalkFunc));
        }
    }

    return shapes;
}

export default function initScene(gl: WebGL2RenderingContext): Scene {
    gl.clearColor(LabelColors.SKY[0], LabelColors.SKY[1], LabelColors.SKY[2], LabelColors.SKY[3]);
    // Create program
    const mainProgram = glu.createProgramFromSource(gl, vertexShaderSource, frgmntShaderSource);

    // Create skybox program
    const skyboxProgram = glu.createProgramFromSource(gl, skyboxVertexShaderSource, skyboxFrgmntShaderSource);
    // Go ahead and bind the first texture unit as that's where we'll bind the cubemap
    const skyboxLoc = gl.getUniformLocation(skyboxProgram, 'u_skybox');
    gl.useProgram(skyboxProgram);
    gl.uniform1i(skyboxLoc, 0);

    const viewportInfo = glu.getViewportInfo(gl);
    const camera = new Camera(
        gl,
        Math.PI / 2,
        viewportInfo.width / viewportInfo.height,
        0.1,
        128,
    );
    camera.rotateX(-Math.PI / 4);
    camera.translate(0, 8, 0);
    const cameraController = initStandardCameraController(gl, camera);

    const buildings = generateBuildings(
        gl,
        3,
        5,
        2,
        8,
        8,
        camera,
        mainProgram,
    );

    const postProgram = glu.createProgramFromSource(gl, postVertexShaderSource, postFrgmntShaderSource);
    const postTexLoc = gl.getUniformLocation(postProgram, 'u_tex');
    gl.useProgram(postProgram);
    gl.uniform1i(postTexLoc, 0);

    // This quad will be used to display post processing
    const renderQuad = new Quad(gl);
    const drawClipFunc = RenderUtils.drawQuadFunction(postProgram);
    const quadDrawer = new Drawer(renderQuad, drawClipFunc);

    const origin = new Cube(gl);
    const drawVegFunc = RenderUtils.drawFunction(camera, mainProgram, LabelColors.VEGETATION);


    // TODO: Remove skybox
    const skybox = new Cube(gl);
    const skyboxDrawFunction = RenderUtils.drawSkyboxFunction(camera, skyboxProgram);
    const skyboxDrawer = new Drawer(skybox, skyboxDrawFunction);

    const scene = new Scene(
        camera,
        [
            cameraController,
        ],
        [
            new Drawer(origin, drawVegFunc),
            ...buildings,
            skyboxDrawer,
        ],
        quadDrawer,
    );


    const fb = glu.createFramebuffer(gl);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    scene.fb1 = fb;

    const level = 0;
    const targetTextureWidth = 256;
    const targetTextureHeight = 256;

    // SET UP DEPTH TEXTURE
    const depthTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    // make a depth buffer and the same size as the targetTexture
    {
        const internalFormat = gl.DEPTH_COMPONENT24;
        const border = 0;
        const format = gl.DEPTH_COMPONENT;
        const type = gl.UNSIGNED_INT;
        const data = null;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            targetTextureWidth, targetTextureHeight, border,
            format, type, data);

        // set the filtering so we don't need mips
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

        // attach the depth texture to the framebuffer
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, level);
    }

    // SET UP TARGET TEXTURE
    const targetTexture = glu.createTexture(gl);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    {
        const internalFormat = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        const data = null;
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            targetTextureWidth,
            targetTextureHeight,
            border,
            format,
            type,
            data,
        );

        // set the filtering so we don't need mips
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, level);
    }


    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

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
