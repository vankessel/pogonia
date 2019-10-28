import Scene, {Drawer, Updater} from "../scene";
import * as glu from "../webglUtils";
import vertexShaderSource from "../shaders/vertex.glsl";
import frgmntShaderSource from "../shaders/frgmnt.glsl";
import skyboxVertexShaderSource from "../shaders/skybox/vertex.glsl";
import skyboxFrgmntShaderSource from "../shaders/skybox/frgmnt.glsl";
import Camera from "../camera";
import {InputState} from "../input";
import {mat4, vec4} from "gl-matrix";
import {World} from "../constants";
import {Cube} from "../primitives";
import RenderUtil from "../renderUtil";

class LabelColors {
    static readonly ROAD = vec4.clone([128, 64, 128, 255].map(val => val / 255));
    static readonly SIDEWALK = vec4.clone([244, 35, 232, 255].map(val => val / 255));
    static readonly BUILDING = vec4.clone([70, 70, 70, 255].map(val => val / 255));
    static readonly CAR = vec4.clone([0, 0, 142, 255].map(val => val / 255));
    static readonly VEGETATION = vec4.clone([107, 142, 35, 255].map(val => val / 255));
    static readonly SKY = vec4.clone([70, 130, 180, 255].map(val => val / 255));
}

function generateBuildings(
    buildingWidth: number,
    buildingHeight: number,
    spacing: number,
    numHor: number,
    numVert: number,
    camera: Camera,
    program: WebGLProgram
): Drawer<Cube>[] {
    const drawRoadFunc = RenderUtil.drawFunction(camera, program, LabelColors.ROAD);
    const drawBuildingFunc = RenderUtil.drawFunction(camera, program, LabelColors.BUILDING);
    const buildingSpacing = buildingWidth + spacing;
    const pos = {x: 0, y: 0};
    const fullWidth = buildingSpacing * numHor - spacing;
    const fullHeight = buildingSpacing * numVert - spacing;
    const leftBound = -fullWidth / 2;
    const bottomBound = -fullHeight / 2;
    const shapes = [];
    for (let col = 0; col < numHor; col++) {
        for (let row = 0; row < numVert; row++) {
            pos.x = leftBound+buildingWidth/2 + col * buildingSpacing;
            pos.y = bottomBound+buildingWidth/2 + row * buildingSpacing;
            const building = new Cube();
            building.translate([pos.x, buildingHeight / 2, pos.y]);
            building.scale([buildingWidth, buildingHeight, buildingWidth]);
            shapes.push(new Drawer(building, drawBuildingFunc));
        }
    }
    const roadPlane = new Cube();
    roadPlane.scale([fullWidth*4, 1, fullHeight*4]);
    roadPlane.translate([0, -0.5, 0]);
    shapes.push(new Drawer(roadPlane, drawRoadFunc));
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
    gl.uniform1i(skyboxLoc, 0);

    const viewportInfo = glu.getViewportInfo(gl);
    const camera = new Camera(
        Math.PI / 2,
        viewportInfo.width / viewportInfo.height,
        0.1,
        64
    );
    camera.translate([0, 4, 0]);
    camera.rotateX(-Math.PI/4);
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

    const buildings = generateBuildings(
        3,
        5,
        2,
        8,
        8,
        camera,
        mainProgram
    );
    const origin = new Cube();
    const drawRoadFunc = RenderUtil.drawFunction(camera, mainProgram, LabelColors.VEGETATION);

    return new Scene(
        camera,
        [
            cameraController
        ],
        [
            new Drawer(origin, drawRoadFunc),
            ...buildings
        ]
    );
}