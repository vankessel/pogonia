import { Vec3, Mat4 } from 'gl-transform';
import * as glu from './utils/webglUtils';

interface Translatable {
    translate(x: number, y: number, z: number): void;
}

interface Rotatable {
    rotate(radians: number, axis: Vec3): void;

    rotateX(radians: number): void;

    rotateY(radians: number): void;

    rotateZ(radians: number): void;
}

interface Scalable {
    scale(x: number, y: number, z: number): void;

    scaleUniform(s: number): void;
}

// All transformations with determinant = 1
export class Rigid extends glu.StaticConstructor implements Translatable, Rotatable {
    transform: Mat4;

    constructor(gl: WebGL2RenderingContext) {
        super(gl);
        this.transform = new Mat4();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-useless-return
    static staticConstructor(gl: WebGL2RenderingContext): void { return; }

    getInverseTransform(): Mat4 {
        const inverseTransform = Mat4.invert(this.transform);
        if (!inverseTransform) {
            throw new Error("Can't invert transform.");
        }
        return inverseTransform;
    }

    getRight(): Vec3 {
        return Vec3.fromValues(
            this.transform[0],
            this.transform[1],
            this.transform[2],
        );
    }

    getLeft(): Vec3 {
        return Vec3.fromValues(
            -this.transform[0],
            -this.transform[1],
            -this.transform[2],
        );
    }

    getUp(): Vec3 {
        return Vec3.fromValues(
            this.transform[4],
            this.transform[5],
            this.transform[6],
        );
    }

    getDown(): Vec3 {
        return Vec3.fromValues(
            -this.transform[4],
            -this.transform[5],
            -this.transform[6],
        );
    }

    getForward(): Vec3 {
        return Vec3.fromValues(
            this.transform[8],
            this.transform[9],
            this.transform[10],
        );
    }

    getBackward(): Vec3 {
        return Vec3.fromValues(
            -this.transform[8],
            -this.transform[9],
            -this.transform[10],
        );
    }

    translate(x: number, y: number, z: number): void {
        Mat4.translate(this.transform, x, y, z, this.transform);
    }

    rotateX(radians: number): void {
        Mat4.rotateX(this.transform, radians, this.transform);
    }

    rotateY(radians: number): void {
        Mat4.rotateY(this.transform, radians, this.transform);
    }

    rotateZ(radians: number): void {
        Mat4.rotateZ(this.transform, radians, this.transform);
    }

    rotate(radians: number, axis: Vec3): void {
        Mat4.rotate(this.transform, radians, axis, this.transform);
    }
}

export class Affine extends Rigid implements Scalable {
    scale(x: number, y: number, z: number): void {
        Mat4.scale(this.transform, x, y, z, this.transform);
    }

    scaleUniform(s: number): void {
        this.scale(s, s, s);
    }
}

export abstract class Shape extends Affine {
    static vao: WebGLVertexArrayObject;
    static mode = WebGL2RenderingContext.TRIANGLES;
    static attribOptions: glu.AttribOptions = {
        size: 3,
        type: WebGL2RenderingContext.FLOAT,
        normalize: false,
        stride: 0,
        offset: 0,
    };

    static positionData: Float32Array;
    static positionBuffer: WebGLBuffer;
    static surfaceNormalData: Float32Array;
    static surfaceNormalBuffer: WebGLBuffer;


    static staticConstructor(gl: WebGL2RenderingContext): void {
        // VAO
        this.vao = glu.createVao(gl);
        gl.bindVertexArray(this.vao);

        // Position attribute
        this.positionBuffer = glu.createBuffer(gl);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.positionData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(
            glu.AttribLoc.POSITION,
            this.attribOptions.size,
            this.attribOptions.type,
            this.attribOptions.normalize,
            this.attribOptions.stride,
            this.attribOptions.offset,
        );
        gl.enableVertexAttribArray(glu.AttribLoc.POSITION);

        // Normal attribute
        this.surfaceNormalBuffer = glu.createBuffer(gl);
        this.surfaceNormalData = this.computeSurfaceNormals();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.surfaceNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.surfaceNormalData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(
            glu.AttribLoc.NORMAL,
            this.attribOptions.size,
            this.attribOptions.type,
            this.attribOptions.normalize,
            this.attribOptions.stride,
            this.attribOptions.offset,
        );
        gl.enableVertexAttribArray(glu.AttribLoc.NORMAL);
        gl.vertexAttribDivisor(glu.AttribLoc.NORMAL, 0);
    }

    static computeSurfaceNormals(): Float32Array {
        const normals = new Float32Array(this.positionData.length);
        for (let idx = 0; idx < this.positionData.length; idx += 9) {
            const first = Vec3.clone(this.positionData.slice(idx, idx + 3));
            const second = Vec3.clone(this.positionData.slice(idx + 3, idx + 6));
            const third = Vec3.clone(this.positionData.slice(idx + 6, idx + 9));

            const a = Vec3.subtract(second, first);
            const b = Vec3.subtract(third, first);

            const normal = Vec3.normalize(Vec3.cross(a, b));
            normals.set(normal, idx);
            normals.set(normal, idx + 3);
            normals.set(normal, idx + 6);
        }
        return normals;
    }
}

export class Quad extends Shape {
    static positionData = new Float32Array([
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,

        1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
    ]);
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
