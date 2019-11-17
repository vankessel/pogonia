import {vec3} from "gl-matrix";

/* TODO:
    Is it possible to make these immutable with Object.freeze(T)?
    That method returns Readonly<T> which breaks a lot of type checks.
*/
export class World {
    static readonly RIGHT: vec3 = vec3.clone([1, 0, 0]);
    static readonly LEFT: vec3 = vec3.clone([-1, 0, 0]);
    static readonly UP: vec3 = vec3.clone([0, 1, 0]);
    static readonly DOWN: vec3 = vec3.clone([0, -1, 0]);
    static readonly FORWARD: vec3 = vec3.clone([0, 0, 1]);
    static readonly BACKWARD: vec3 = vec3.clone([0, 0, -1]);
}
