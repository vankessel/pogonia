import { Rigid } from './primitives';
import * as m4 from './m4';

export default class Camera extends Rigid {
    projection: number[];

    private inverseTransform: number[];
    private inverseTransformMemoized: boolean;

    constructor(xFov: number, aspect: number, near: number, far: number) {
        super();
        this.projection = m4.projection(xFov, aspect, near, far);
        this.inverseTransform = m4.inverse(this._transform);
        this.inverseTransformMemoized = true;
    }

    // Must override getter even though it hasn't changed from subclass
    // because we override the setter due to a TypeScript quirk.
    // https://stackoverflow.com/q/28950760
    get transform(): number[] {
        return this._transform;
    }

    set transform(value: number[]) {
        this._transform = value;
        this.inverseTransformMemoized = false;
    }

    get worldToView(): number[] {
        if (!this.inverseTransformMemoized) {
            this.inverseTransform = m4.inverse(this.transform);
            this.inverseTransformMemoized = true;
        }
        return this.inverseTransform;
    }

    set worldToView(mat4: number[]) {
        this._transform = m4.inverse(mat4);
        this.inverseTransform = mat4;
        this.inverseTransformMemoized = true;
    }
}