import {mat4, vec3} from 'gl-matrix';
import * as glu from "./utils/webglUtils";
import {AttribLoc, AttribOptions} from "./utils/webglUtils";
import {StaticConstructor} from "./utils/utils";

interface Translatable {
    translate(dir: vec3 | number[]): void;
}

interface Rotatable {
    rotateX(radians: number): void;

    rotateY(radians: number): void;

    rotateZ(radians: number): void;
}

interface Scalable {
    scale(sx: number, sy?: number, sz?: number): void;
}

// All transformations with determinant = 1
export class Rigid extends StaticConstructor implements Translatable, Rotatable {
    transform: mat4;

    constructor() {
        super();
        this.transform = mat4.create();
    }

    getInverseTransform(): mat4 {
        const inverseTransform = mat4.invert(mat4.create(), this.transform);
        if (!inverseTransform) {
            throw "Can't invert transform.";
        }
        return inverseTransform;
    }

    getRight(): vec3 {
        return vec3.clone([
            this.transform[0],
            this.transform[1],
            this.transform[2],
        ]);
    }

    getLeft(): vec3 {
        return vec3.clone([
            -this.transform[0],
            -this.transform[1],
            -this.transform[2],
        ]);
    }

    getUp(): vec3 {
        return vec3.clone([
            this.transform[4],
            this.transform[5],
            this.transform[6],
        ]);
    }

    getDown(): vec3 {
        return vec3.clone([
            -this.transform[4],
            -this.transform[5],
            -this.transform[6],
        ]);
    }

    getForward(): vec3 {
        return vec3.clone([
            this.transform[8],
            this.transform[9],
            this.transform[10],
        ]);
    }

    getBackward(): vec3 {
        return vec3.clone([
            -this.transform[8],
            -this.transform[9],
            -this.transform[10],
        ]);
    }

    translate(dir: vec3 | number[]): void {
        mat4.translate(this.transform, this.transform, dir);
    }

    rotateX(radians: number): void {
        mat4.rotateX(this.transform, this.transform, radians);
    }

    rotateY(radians: number): void {
        mat4.rotateY(this.transform, this.transform, radians);
    }

    rotateZ(radians: number): void {
        mat4.rotateZ(this.transform, this.transform, radians);
    }

    rotateAxis(radians: number, axis: vec3 | number[]): void {
        mat4.rotate(this.transform, this.transform, radians, axis);
    }

}

export class Affine extends Rigid implements Scalable {
    scale(s: number | number[] | vec3): void {
        if (typeof s === 'number') {
            mat4.scale(this.transform, this.transform, [s, s, s])
        } else {
            mat4.scale(this.transform, this.transform, s);
        }
    }
}

export abstract class Shape extends Affine {
    static vao: WebGLVertexArrayObject;
    static mode = WebGL2RenderingContext.TRIANGLES;
    static attribOptions: AttribOptions = {
        size: 3,
        type: WebGL2RenderingContext.FLOAT,
        normalize: false,
        stride: 0,
        offset: 0
    };

    static positionData: Float32Array;
    static positionBuffer: WebGLBuffer;
    // TODO: Add support for interpolated vertex normals
    static surfaceNormalData: Float32Array;
    static surfaceNormalBuffer: WebGLBuffer;

    static staticConstructor(): void {
        this.surfaceNormalData = this.computeSurfaceNormals();
    }

    constructor() {
        super();
    }

    static initVao(gl: WebGL2RenderingContext): void {
        // Return early if VAO has already been initialized for this class
        if (Object.prototype.hasOwnProperty.call(this, 'vao')) {
            return;
        }
        this.vao = glu.createVao(gl);
        gl.bindVertexArray(this.vao);

        if (!this.positionBuffer) {
            this.positionBuffer = glu.createBuffer(gl);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.positionData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(
            AttribLoc.POSITION,
            this.attribOptions.size,
            this.attribOptions.type,
            this.attribOptions.normalize,
            this.attribOptions.stride,
            this.attribOptions.offset,
        );
        gl.enableVertexAttribArray(AttribLoc.POSITION);

        if (!this.surfaceNormalBuffer) {
            this.surfaceNormalBuffer = glu.createBuffer(gl);
        }
        if (!this.surfaceNormalData) {
            this.surfaceNormalData = this.computeSurfaceNormals();
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.surfaceNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.surfaceNormalData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(
            AttribLoc.NORMAL,
            this.attribOptions.size,
            this.attribOptions.type,
            this.attribOptions.normalize,
            this.attribOptions.stride,
            this.attribOptions.offset,
        );
        gl.enableVertexAttribArray(AttribLoc.NORMAL);
        gl.vertexAttribDivisor(AttribLoc.NORMAL, 0);
    }

    static computeSurfaceNormals(): Float32Array {
        const normals: number[] = [];
        for (let idx = 0; idx < this.positionData.length; idx+=9) {
            const first = vec3.clone(this.positionData.slice(idx, idx + 3));
            const second = vec3.clone(this.positionData.slice(idx + 3, idx + 6));
            const third = vec3.clone(this.positionData.slice(idx + 6, idx + 9));

            const a = vec3.subtract(vec3.create(), second, first);
            const b = vec3.subtract(vec3.create(), third, first);

            const normal = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), a, b));
            normals.push(
                ...normal,
                ...normal,
                ...normal
            );
        }
        return new Float32Array(normals);
    }
}

export class Cube extends Shape {
    static positionData = new Float32Array([
        // Front 1/2
        0.5, 0.5, 0.5,    // 0 Top Right Front
        -0.5, 0.5, 0.5,   // 1 Top Left  Front
        -0.5, -0.5, 0.5,  // 3 Bot Left  Front

        // Front 2/2
        0.5, 0.5, 0.5,    // 0 Top Right Front
        -0.5, -0.5, 0.5,  // 3 Bot Left  Front
        0.5, -0.5, 0.5,   // 2 Bot Right Front

        // Right 1/2
        0.5, 0.5, 0.5,    // 0 Top Right Front
        0.5, -0.5, 0.5,   // 2 Bot Right Front
        0.5, -0.5, -0.5,  // 6 Bot Right Back

        // Right 2/2
        0.5, 0.5, 0.5,    // 0 Top Right Front
        0.5, -0.5, -0.5,  // 6 Bot Right Back
        0.5, 0.5, -0.5,   // 4 Top Right Back

        // Back 1/2
        0.5, -0.5, -0.5,  // 6 Bot Right Back
        -0.5, 0.5, -0.5,  // 5 Top Left  Back
        0.5, 0.5, -0.5,   // 4 Top Right Back

        // Back 2/2
        0.5, -0.5, -0.5,  // 6 Bot Right Back
        -0.5, -0.5, -0.5, // 7 Bot Left  Back
        -0.5, 0.5, -0.5,  // 5 Top Left  Back

        // Left 1/2
        -0.5, 0.5, -0.5,  // 5 Top Left  Back
        -0.5, -0.5, -0.5, // 7 Bot Left  Back
        -0.5, -0.5, 0.5,  // 3 Bot Left  Front

        // Left 2/2
        -0.5, 0.5, -0.5,  // 5 Top Left  Back
        -0.5, -0.5, 0.5,  // 3 Bot Left  Front
        -0.5, 0.5, 0.5,   // 1 Top Left  Front

        // Bot 1/2
        -0.5, -0.5, 0.5,  // 3 Bot Left  Front
        0.5, -0.5, -0.5,  // 6 Bot Right Back
        0.5, -0.5, 0.5,   // 2 Bot Right Front

        // Bot 2/2
        -0.5, -0.5, 0.5,  // 3 Bot Left  Front
        -0.5, -0.5, -0.5, // 7 Bot Left  Back
        0.5, -0.5, -0.5,  // 6 Bot Right Back

        // Top 1/2
        -0.5, 0.5, 0.5,   // 1 Top Left  Front
        0.5, 0.5, 0.5,    // 0 Top Right Front
        0.5, 0.5, -0.5,   // 4 Top Right Back

        // Top 2/2
        -0.5, 0.5, 0.5,   // 1 Top Left  Front
        0.5, 0.5, -0.5,   // 4 Top Right Back
        -0.5, 0.5, -0.5,  // 5 Top Left  Back
    ]);
}
