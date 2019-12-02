import { Vec3 } from 'gl-transform';

/* TODO:
    Is it possible to make these immutable with Object.freeze(T)?
    That method returns Readonly<T> which breaks a lot of type checks.
*/
export class World {
    static readonly RIGHT: Vec3 = Vec3.from([1, 0, 0]);
    static readonly LEFT: Vec3 = Vec3.from([-1, 0, 0]);
    static readonly UP: Vec3 = Vec3.from([0, 1, 0]);
    static readonly DOWN: Vec3 = Vec3.from([0, -1, 0]);
    static readonly FORWARD: Vec3 = Vec3.from([0, 0, 1]);
    static readonly BACKWARD: Vec3 = Vec3.from([0, 0, -1]);
}

export const GRAVITY = 9.81;
