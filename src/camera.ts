import {Rigid} from './primitives';
import {mat4, vec3} from 'gl-matrix';
import {Updater} from "./scene";
import {InputState} from "./input";
import {World} from "./utils/constants";
import {getViewportInfo} from "./utils/webglUtils";

export default class Camera extends Rigid {
    readonly yFov: number;
    readonly aspect: number;
    readonly near: number;
    readonly far: number;

    projection: mat4;

    private transformMemoizedValue: mat4;
    private inverseTransformMemoizedValue: mat4;

    constructor(gl: WebGL2RenderingContext, yFov: number, aspect: number, near: number, far: number) {
        super(gl);
        this.yFov = yFov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.projection = mat4.perspective(mat4.create(), yFov, aspect, near, far);
        this.transformMemoizedValue = mat4.clone(this.transform);
        this.inverseTransformMemoizedValue = this.getInverseTransform();
    }

    getDirection(): vec3 {
        return this.getBackward();
    }

    getWorldToView(): mat4 {
        if (!mat4.exactEquals(this.transform, this.transformMemoizedValue)) {
            this.transformMemoizedValue = mat4.clone(this.transform);
            this.inverseTransformMemoizedValue = this.getInverseTransform();
        }
        return mat4.clone(this.inverseTransformMemoizedValue);
    }

    getSkyboxWorldToView(): mat4 {
        const untranslated = this.getWorldToView();
        untranslated[12] = 0;
        untranslated[13] = 0;
        untranslated[14] = 0;
        return untranslated;
    }
}

export function initStandardCameraController(gl: WebGL2RenderingContext, camera: Camera): Updater<Camera> {
    const viewportInfo = getViewportInfo(gl);
    const xFovPerPixel = camera.yFov * camera.aspect / viewportInfo.width;
    const yFovPerPixel = camera.yFov / viewportInfo.height;
    return new Updater(camera, function (camera: Camera, deltaTime: number, input: InputState): void {
        let cameraDeltaX = 0;
        let cameraDeltaY = 0;
        if (input.mouse.pressed && input.mouse.button === 0) {
            cameraDeltaX = input.mouse.movement.x * xFovPerPixel;
            cameraDeltaY = input.mouse.movement.y * yFovPerPixel;
        }
        const sensitivity = 2;
        camera.rotateX(-cameraDeltaY * sensitivity);
        // Rotate camera at its position relative to world up axis
        const tx = camera.transform[12];
        const ty = camera.transform[13];
        const tz = camera.transform[14];
        camera.transform[12] = 0;
        camera.transform[13] = 0;
        camera.transform[14] = 0;
        const rotMat = mat4.fromRotation(mat4.create(), -cameraDeltaX * sensitivity, World.UP);
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
}