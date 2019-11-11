import {mat4, vec3} from 'gl-matrix';
import * as glu from "./webglUtils";
import {AttribLoc} from "./constants";

interface AttribOptions {
    size: GLint;
    type: GLenum;
    normalize: GLboolean;
    stride: GLsizei;
    offset: GLintptr;
}

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
export class Rigid implements Translatable, Rotatable {
    transform: mat4;

    constructor() {
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

export class Shape extends Affine {
    static vao: WebGLVertexArrayObject;
    static indexBuffer: WebGLBuffer;
    static indexArray: Uint16Array;
    static positionBuffer: WebGLBuffer;
    static positionArray: Float32Array;
    static mode = WebGL2RenderingContext.TRIANGLES;
    static attribOptions: AttribOptions = {
        size: 3,
        type: WebGL2RenderingContext.FLOAT,
        normalize: false,
        stride: 0,
        offset: 0
    };

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

        if (!this.indexBuffer) {
            this.indexBuffer = glu.createBuffer(gl);
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexArray, gl.STATIC_DRAW);

        if (!this.positionBuffer) {
            this.positionBuffer = glu.createBuffer(gl);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.positionArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(
            AttribLoc.POSITION,
            this.attribOptions.size,
            this.attribOptions.type,
            this.attribOptions.normalize,
            this.attribOptions.stride,
            this.attribOptions.offset,
        );
        gl.enableVertexAttribArray(AttribLoc.POSITION);
    }
}

export class Cube extends Shape {
    static positionArray = new Float32Array([
        0.5, 0.5, 0.5,    // 0 Top Right Front
        -0.5, 0.5, 0.5,   // 1 Top Left  Front
        0.5, -0.5, 0.5,   // 2 Bot Right Front
        -0.5, -0.5, 0.5,  // 3 Bot Left  Front
        0.5, 0.5, -0.5,   // 4 Top Right Back
        -0.5, 0.5, -0.5,  // 5 Top Left  Back
        0.5, -0.5, -0.5,  // 6 Bot Right Back
        -0.5, -0.5, -0.5, // 7 Bot Left  Back
    ]);
    static indexArray = new Uint16Array([
        5, 4, 7, 6, 2, 4, 0, 5, 1, 7, 3, 2, 1, 0
    ]);
    static mode = WebGL2RenderingContext.TRIANGLE_STRIP;
}

export class Skybox extends Cube {
    static indexArray = new Uint16Array([
        1, 0, 3, 2, 6, 0, 4, 1, 5, 3, 7, 6, 5, 4
    ]);
}

export class BigF extends Shape {
    static positionArray = new Float32Array([
        // left column front
        0, 0, 0,
        0, 150, 0,
        30, 0, 0,
        0, 150, 0,
        30, 150, 0,
        30, 0, 0,

        // top rung front
        30, 0, 0,
        30, 30, 0,
        100, 0, 0,
        30, 30, 0,
        100, 30, 0,
        100, 0, 0,

        // middle rung front
        30, 60, 0,
        30, 90, 0,
        67, 60, 0,
        30, 90, 0,
        67, 90, 0,
        67, 60, 0,

        // left column back
        0, 0, 30,
        30, 0, 30,
        0, 150, 30,
        0, 150, 30,
        30, 0, 30,
        30, 150, 30,

        // top rung back
        30, 0, 30,
        100, 0, 30,
        30, 30, 30,
        30, 30, 30,
        100, 0, 30,
        100, 30, 30,

        // middle rung back
        30, 60, 30,
        67, 60, 30,
        30, 90, 30,
        30, 90, 30,
        67, 60, 30,
        67, 90, 30,

        // top
        0, 0, 0,
        100, 0, 0,
        100, 0, 30,
        0, 0, 0,
        100, 0, 30,
        0, 0, 30,

        // top rung right
        100, 0, 0,
        100, 30, 0,
        100, 30, 30,
        100, 0, 0,
        100, 30, 30,
        100, 0, 30,

        // under top rung
        30, 30, 0,
        30, 30, 30,
        100, 30, 30,
        30, 30, 0,
        100, 30, 30,
        100, 30, 0,

        // between top rung and middle
        30, 30, 0,
        30, 60, 30,
        30, 30, 30,
        30, 30, 0,
        30, 60, 0,
        30, 60, 30,

        // top of middle rung
        30, 60, 0,
        67, 60, 30,
        30, 60, 30,
        30, 60, 0,
        67, 60, 0,
        67, 60, 30,

        // right of middle rung
        67, 60, 0,
        67, 90, 30,
        67, 60, 30,
        67, 60, 0,
        67, 90, 0,
        67, 90, 30,

        // bottom of middle rung.
        30, 90, 0,
        30, 90, 30,
        67, 90, 30,
        30, 90, 0,
        67, 90, 30,
        67, 90, 0,

        // right of bottom
        30, 90, 0,
        30, 150, 30,
        30, 90, 30,
        30, 90, 0,
        30, 150, 0,
        30, 150, 30,

        // bottom
        0, 150, 0,
        0, 150, 30,
        30, 150, 30,
        0, 150, 0,
        30, 150, 30,
        30, 150, 0,

        // left side
        0, 0, 0,
        0, 0, 30,
        0, 150, 30,
        0, 0, 0,
        0, 150, 30,
        0, 150, 0,
    ]).map(function (val: number) {
        return val / 300;
    });
    static indexArray = new Uint16Array(Array.from(Array(BigF.positionArray.length / 3).keys()));
}