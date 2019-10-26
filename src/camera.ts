import {Rigid} from './primitives';
import {mat4, vec3} from 'gl-matrix';
import {World} from "./constants";
import {InputState} from "./input";

export default class Camera extends Rigid {
    projection: mat4;

    private transformMemoizedValue: mat4;
    private inverseTransformMemoizedValue: mat4;

    constructor(yFov: number, aspect: number, near: number, far: number) {
        super();
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

export class ControllableCamera extends Camera {
    update(deltaTime: number, input: InputState): void {
        let cameraDeltaX = 0;
        let cameraDeltaY = 0;
        if (input.mouse.pressed) {
            cameraDeltaX = input.mouse.movement.x;
            cameraDeltaY = input.mouse.movement.y;
        }
        this.rotateX(-cameraDeltaY * deltaTime);
        // Rotate camera at its position relative to world up axis
        const tx = this.transform[12];
        const ty = this.transform[13];
        const tz = this.transform[14];
        this.transform[12] = 0;
        this.transform[13] = 0;
        this.transform[14] = 0;
        const rotMat = mat4.fromRotation(mat4.create(), -cameraDeltaX * deltaTime, World.UP);
        mat4.multiply(this.transform, rotMat, this.transform);
        this.transform[12] = tx;
        this.transform[13] = ty;
        this.transform[14] = tz;

        if (input.keys.w) {
            this.translate([0, 0, -deltaTime]);
        }
        if (input.keys.a) {
            this.translate([-deltaTime, 0, 0]);
        }
        if (input.keys.s) {
            this.translate([0, 0, deltaTime]);
        }
        if (input.keys.d) {
            this.translate([deltaTime, 0, 0]);
        }
    }
}