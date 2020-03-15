import { Vec4 } from 'gl-transform';
import Scene, {
    Drawer, Renderable, RenderTarget, SequencedRenderer,
} from '../scene';
import * as glu from '../utils/glUtils';
import vertexShaderSource from '../shaders/vertex.glsl';
import frgmntShaderSource from '../shaders/frgmnt.glsl';
import skyboxVertexShaderSource from '../shaders/skybox/vertex.glsl';
import skyboxFrgmntShaderSource from '../shaders/skybox/frgmnt.glsl';
import convVertexShaderSource from '../shaders/conv/vertex_quad.glsl';
import convFrgmntShaderSource from '../shaders/conv/frgmnt_7x7_relu.glsl';
import Camera, { initStandardCameraController } from '../camera';
import { Cube, Quad } from '../primitives';
import RenderUtils from '../utils/renderUtils';
import skyboxRightSrc from '../../assets/skybox/right.jpg';
import skyboxLeftSrc from '../../assets/skybox/left.jpg';
import skyboxTopSrc from '../../assets/skybox/top.jpg';
import skyboxBottomSrc from '../../assets/skybox/bottom.jpg';
import skyboxBackSrc from '../../assets/skybox/back.jpg';
import skyboxFrontSrc from '../../assets/skybox/front.jpg';
import stateDict from '../../assets/model.json';

class LabelColors {
    static readonly ROAD = Vec4.from([128, 64, 128, 255].map((val) => val / 255));
    static readonly SIDEWALK = Vec4.from([244, 35, 232, 255].map((val) => val / 255));
    static readonly BUILDING = Vec4.from([70, 70, 70, 255].map((val) => val / 255));
    static readonly CAR = Vec4.from([0, 0, 142, 255].map((val) => val / 255));
    static readonly VEGETATION = Vec4.from([107, 142, 35, 255].map((val) => val / 255));
    static readonly SKY = Vec4.from([70, 130, 180, 255].map((val) => val / 255));
}

function generateCity(
    gl: WebGL2RenderingContext,
    buildingWidth: number,
    buildingHeight: number,
    spacing: number,
    numHor: number,
    numVert: number,
    camera: Camera,
    program: WebGLProgram,
): Drawer<Cube>[] {
    const drawRoadFunc = RenderUtils.drawFunction(gl, camera, program, LabelColors.ROAD);
    const drawBuildingFunc = RenderUtils.drawFunction(gl, camera, program, LabelColors.BUILDING);
    const drawSidewalkFunc = RenderUtils.drawFunction(gl, camera, program, LabelColors.SIDEWALK);

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
            let sx;
            let sz;
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

    const buildings = generateCity(
        gl,
        3,
        5,
        2,
        8,
        8,
        camera,
        mainProgram,
    );

    const convProgram = glu.createProgramFromSource(gl, convVertexShaderSource, convFrgmntShaderSource);
    gl.useProgram(convProgram);
    // Previous layer in texture0 (rendered scene in case of the first layer)
    const convTexLoc = gl.getUniformLocation(convProgram, 'u_tex');
    gl.uniform1i(convTexLoc, 0);
    // Convolution kernel in texture1
    const convKernelLoc = gl.getUniformLocation(convProgram, 'u_kernel');
    gl.uniform1i(convKernelLoc, 1);
    // Number of feature kernels (The number of 2D array texture layers)
    const featuresLoc = gl.getUniformLocation(convProgram, 'u_features');
    gl.uniform1i(featuresLoc, 1);

    // This quad will be used to display post processing
    const renderQuad = new Quad(gl);
    const drawQuadFunction = RenderUtils.drawQuadFunction(convProgram);
    const quadDrawer = new Drawer(renderQuad, drawQuadFunction);

    const origin = new Cube(gl);
    const drawVegFunc = RenderUtils.drawFunction(gl, camera, mainProgram, LabelColors.VEGETATION);

    // TODO: Remove skybox
    const skybox = new Cube(gl);
    const skyboxDrawFunction = RenderUtils.drawSkyboxFunction(gl, camera, skyboxProgram);
    const skyboxDrawer = new Drawer(skybox, skyboxDrawFunction);

    const fb = glu.createFramebuffer(gl);

    const sceneRenderTarget = new RenderTarget(fb);
    const postRenderTarget = new RenderTarget(null);

    const renderTargets = [
        sceneRenderTarget,
        postRenderTarget,
    ];

    const renderables: Set<Renderable> = SequencedRenderer.genRenderables(
        sceneRenderTarget,
        [
            new Drawer(origin, drawVegFunc),
            ...buildings,
            skyboxDrawer,
        ],
    );

    const postRenderables: Set<Renderable> = SequencedRenderer.genRenderables(
        postRenderTarget,
        [
            quadDrawer,
        ],
    );

    for (const postRenderable of postRenderables) {
        renderables.add(postRenderable);
    }

    const scene = new Scene(
        camera,
        [
            cameraController,
        ],
        [
            new SequencedRenderer(
                renderTargets,
                renderables,
            ),
        ],
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

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
        const internalFormat = gl.RGB;
        const border = 0;
        const format = gl.RGB;
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
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, level);
    }

    // The following kernel is loaded upside down and needs to be flipped.
    // This is the first layer of the neural network.
    // eslint-disable-next-line max-len
    const kernelData = new Float32Array([0.04010304436087608, 0.03981295973062515, 0.23406921327114105, 0.0, -0.09602755308151245, 0.049237288534641266, 0.197612926363945, 0.0, -0.219570130109787, 0.05548691749572754, -0.037985220551490784, 0.0, -0.17984774708747864, 0.06912299990653992, -0.09351897984743118, 0.0, -0.04595965892076492, 0.08114919811487198, 0.08479129523038864, 0.0, 0.026715228334069252, 0.07139582186937332, 0.16610686480998993, 0.0, -0.01910889521241188, -0.03701195865869522, 0.17941460013389587, 0.0, -0.043812647461891174, 0.005212150514125824, 0.13533549010753632, 0.0, -0.1580565869808197, 0.053983837366104126, 0.03668912500143051, 0.0, -0.16697508096694946, 0.07110106945037842, -0.28096428513526917, 0.0, -0.15715394914150238, 0.0628812238574028, -0.4012681841850281, 0.0, -0.10723449289798737, 0.051164671778678894, -0.06830332428216934, 0.0, -0.022535433992743492, 0.08037423342466354, 0.07580684125423431, 0.0, -0.013510125689208508, -0.10050749033689499, 0.05845150724053383, 0.0, -0.0690397098660469, -0.0017427721759304404, 0.044766705483198166, 0.0, -0.145542711019516, 0.03192311152815819, -0.12043780088424683, 0.0, -0.13390858471393585, 0.09165094792842865, -0.6543151140213013, 0.0, -0.13343864679336548, 0.056821949779987335, -0.7657198905944824, 0.0, -0.11094384640455246, 0.032116521149873734, -0.18466489017009735, 0.0, -0.05492422357201576, 0.0003729641903191805, -0.026935448870062828, 0.0, -0.04508492350578308, -0.0706484392285347, -0.011751458048820496, 0.0, -0.0322798416018486, 0.007516331505030394, 0.11390315741300583, 0.0, -0.03882464021444321, 0.04650156572461128, -0.10693664103746414, 0.0, -0.08482854813337326, 0.15252430737018585, -0.6234499216079712, 0.0, -0.07468190789222717, 0.13467364013195038, -0.7529401779174805, 0.0, -0.059912487864494324, 0.12676391005516052, -0.17374129593372345, 0.0, 0.012804269790649414, 0.02214655466377735, 0.038341715931892395, 0.0, -0.004569008015096188, -0.07143111526966095, -0.0069286273792386055, 0.0, 0.0031316301319748163, 0.027346136048436165, 0.1458195596933365, 0.0, -0.000544146925676614, 0.046093665063381195, 0.006124335341155529, 0.0, -0.07163925468921661, 0.1005154624581337, -0.3917027413845062, 0.0, -0.06973829120397568, 0.10276055335998535, -0.4739280343055725, 0.0, -0.038851719349622726, 0.06309900432825089, -0.02413828857243061, 0.0, 0.03942446783185005, 0.0755574032664299, 0.11419767886400223, 0.0, 0.04792890325188637, -0.05312899500131607, 0.07570409029722214, 0.0, 0.03308512642979622, 0.0156540684401989, 0.17266520857810974, 0.0, -0.06249931827187538, 0.02282671630382538, 0.07553976029157639, 0.0, -0.1207745149731636, 0.10512668639421463, -0.1897190362215042, 0.0, -0.059293556958436966, 0.066048763692379, -0.16886790096759796, 0.0, -0.004926545545458794, 0.08779396861791611, 0.06073841080069542, 0.0, 0.03021658957004547, 0.09748560935258865, 0.12082625925540924, 0.0, 0.05533294007182121, 0.009419281966984272, 0.14529608190059662, 0.0, 0.010969954542815685, -0.022937778383493423, 0.09956691414117813, 0.0, -0.07475673407316208, 0.03585087135434151, 0.05460767820477486, 0.0, -0.12962062656879425, 0.020410476252436638, -0.06460069864988327, 0.0, -0.1276080310344696, 0.08109194785356522, -0.11140135675668716, 0.0, -0.05761196091771126, 0.07920469343662262, 0.039230186492204666, 0.0, 0.04043319821357727, 0.0837881788611412, 0.12334886938333511, 0.0, 0.016894472762942314, -0.0008298332686536014, 0.14428207278251648, 0.0]);
    const kernelTexture = glu.createTexture(gl);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, kernelTexture);
    {
        const internalFormat = gl.RGBA32F;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.FLOAT;
        gl.texImage3D(
            gl.TEXTURE_2D_ARRAY,
            level,
            internalFormat,
            7,
            7,
            1,
            border,
            format,
            type,
            kernelData,
        );

        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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
