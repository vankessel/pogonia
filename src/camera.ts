import {Rigid} from './primitives';
import {mat4, quat} from 'gl-matrix';

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

    getWorldToView(): mat4 {
        if (!mat4.exactEquals(this.transform, this.transformMemoizedValue)) {
            this.transformMemoizedValue = mat4.clone(this.transform);
            this.inverseTransformMemoizedValue = this.getInverseTransform();
        }
        return mat4.clone(this.inverseTransformMemoizedValue);
    }

    getSkyboxWorldToView(): mat4 {
        return mat4.fromQuat(mat4.create(), mat4.getRotation(quat.create(), this.getWorldToView()));
    }
}