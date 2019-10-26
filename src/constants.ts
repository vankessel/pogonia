import {vec3} from "gl-matrix";

export enum AttribLoc {
    POSITION = 0,
}

export class World {
    static readonly RIGHT: vec3 = vec3.clone([1,0,0]);
    static readonly LEFT: vec3 = vec3.clone([-1,0,0]);
    static readonly UP = [0,1,0];
    static readonly DOWN: vec3 = vec3.clone([0,-1,0]);
    static readonly FORWARD: vec3 = vec3.clone([0,0,1]);
    static readonly BACKWARD: vec3 = vec3.clone([0,0,-1]);
}