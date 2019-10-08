import * as m4 from './m4';

class Entity {
    transform: number[];

    constructor() {
        this.transform = m4.identity();
    }

    translate(dx: number, dy: number, dz: number): void {
        this.transform = m4.translate(this.transform, dx, dy, dz)
    }

    scale(sx: number, sy: number, sz: number): void {
        this.transform = m4.scale(this.transform, sx, sy, sz);
    }

    xRotate(radians: number): void {
        this.transform = m4.xRotate(this.transform, radians);
    }

    yRotate(radians: number): void {
        this.transform = m4.yRotate(this.transform, radians);
    }

    zRotate(radians: number): void {
        this.transform = m4.zRotate(this.transform, radians);
    }
}

class Cube extends Entity{
    size: object;

    constructor(dx: number, dy: number, dz: number) {
        super();
        this.size = {
            x: dx,
            y: dy,
            z: dz
        }
    }
}