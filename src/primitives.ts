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

    static indexBuffer: WebGLBuffer;
    static indexArray: Uint16Array;
    static positionBuffer: WebGLBuffer;
    static positionArray: Float32Array;

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
    static mode = WebGL2RenderingContext.TRIANGLE_STRIP;
    static indexArray = new Uint16Array([
        5, 4, 7, 6, 2, 4, 0, 5, 1, 7, 3, 2, 1, 0
    ]);
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
    static normals: Float32Array;
    static computeNormals(): Float32Array {

        const edges = [];
        for (let i = 1; i < this.indexArray.length; i++) {
            const idx = this.indexArray[i];
            const prevIdx = this.indexArray[i - 1];

            edges.push(
                vec3.subtract(
                    vec3.create(),
                    vec3.clone(Cube.positionArray.slice(idx * 3, (idx + 1) * 3)),
                    vec3.clone(Cube.positionArray.slice(prevIdx * 3, (prevIdx + 1) * 3)),
                ),
            );
        }

        const normals: number[] = [];
        for (let idx = 1; idx < edges.length; idx++) {
            const parity = idx % 2;
            if (parity === 1) {
                normals.push(
                    ...vec3.cross(vec3.create(), edges[idx-1], edges[idx])
                );
            } else {
                normals.push(
                    ...vec3.cross(vec3.create(), edges[idx], edges[idx-1])
                );
            }
        }
        return new Float32Array(normals);
    }

    protected static staticConstructor(): void {
        this.normals = this.computeNormals();
        console.log((this.normals));
    }
}

export class Skybox extends Cube {
    static indexArray = new Uint16Array([
        1, 0, 3, 2, 6, 0, 4, 1, 5, 3, 7, 6, 5, 4
    ]);
}
