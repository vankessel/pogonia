export function ortho(width: number, aspect: number, near: number, far: number): number[] {
    const idz = 1 / (near - far);
    const height = width * aspect;
    return [
        1 / width, 0, 0, 0,
        0, 1 / height, 0, 0,
        0, 0, 2 * idz, (near + far) * idz,
        0, 0, 0, 1,
    ];
}

export function projection(xFov: number, aspect: number, near: number, far: number): number[] {
    const idz = 1 / (near - far);
    const yFov = xFov * aspect;
    return [
        Math.atan(xFov / 2), 0, 0, 0,
        0, Math.atan(yFov / 2), 0, 0,
        0, 0, (near + far) * idz, 2 * near * far * idz,
        0, 0, -1, 0,
    ];
}

export function multiply(a: number[], b: number[]): number[] {
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a03 = a[3];
    const a10 = a[4];
    const a11 = a[5];
    const a12 = a[6];
    const a13 = a[7];
    const a20 = a[8];
    const a21 = a[9];
    const a22 = a[10];
    const a23 = a[11];
    const a30 = a[12];
    const a31 = a[13];
    const a32 = a[14];
    const a33 = a[15];
    const b00 = b[0];
    const b01 = b[1];
    const b02 = b[2];
    const b03 = b[3];
    const b10 = b[4];
    const b11 = b[5];
    const b12 = b[6];
    const b13 = b[7];
    const b20 = b[8];
    const b21 = b[9];
    const b22 = b[10];
    const b23 = b[11];
    const b30 = b[12];
    const b31 = b[13];
    const b32 = b[14];
    const b33 = b[15];

    return [
        a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
        a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
        a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
        a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
        a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
        a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
        a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
        a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
        a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
        a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
        a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
        a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
        a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
        a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
        a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
        a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33,
    ];
}

export function emultiply(s: number, m: number[]): number[] {
    const m00 = s * m[0];
    const m01 = s * m[1];
    const m02 = s * m[2];
    const m03 = s * m[3];
    const m10 = s * m[4];
    const m11 = s * m[5];
    const m12 = s * m[6];
    const m13 = s * m[7];
    const m20 = s * m[8];
    const m21 = s * m[9];
    const m22 = s * m[10];
    const m23 = s * m[11];
    const m30 = s * m[12];
    const m31 = s * m[13];
    const m32 = s * m[14];
    const m33 = s * m[15];

    return [
        m00, m01, m02, m03,
        m10, m11, m12, m13,
        m20, m21, m22, m23,
        m30, m31, m32, m33,
    ];
}

export function det(m: number[]): number {
    const m00 = m[0];
    const m01 = m[1];
    const m02 = m[2];
    const m03 = m[3];
    const m10 = m[4];
    const m11 = m[5];
    const m12 = m[6];
    const m13 = m[7];
    const m20 = m[8];
    const m21 = m[9];
    const m22 = m[10];
    const m23 = m[11];
    const m30 = m[12];
    const m31 = m[13];
    const m32 = m[14];
    const m33 = m[15];
    const a = m22 * m33 - m23 * m32;
    const b = m21 * m33 - m23 * m31;
    const c = m21 * m32 - m22 * m31;
    const d = m20 * m33 - m23 * m30;
    const e = m20 * m32 - m22 * m30;
    const f = m20 * m31 - m21 * m30;
    return m00 * (m11 * a - m12 * b + m13 * c) - m01 * (m10 * a - m12 * d + m13 * e) + m02 * (m10 * b - m11 * d + m13 * f) - m03 * (m10 * c - m11 * e + m12 * f);
}

export function trace(m: number[]): number {
    return m[0] + m[5] + m[10] + m[15];
}

export function identity(s = 1): number[] {
    return [
        s, 0, 0, 0,
        0, s, 0, 0,
        0, 0, s, 0,
        0, 0, 0, s,
    ];
}

export function translation(dx: number, dy: number, dz: number): number[] {
    return [
        1, 0, 0, dx,
        0, 1, 0, dy,
        0, 0, 1, dz,
        0, 0, 0, 1,
    ];
}

export function scaling(sx: number, sy: number, sz: number): number[] {
    return [
        sx, 0, 0, 0,
        0, sy, 0, 0,
        0, 0, sz, 0,
        0, 0, 0, 1,
    ];
}

export function xRotation(radians: number): number[] {
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    return [
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1,
    ];
}

export function yRotation(radians: number): number[] {
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    return [
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1,
    ];
}

export function zRotation(radians: number): number[] {
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    return [
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}

export function translate(m: number[], dx: number, dy: number, dz: number): number[] {
    return multiply(m, translation(dx, dy, dz));
}

// Scale uniformly if given 1 argument
// Do not scale undefined dimension if given 2 arguments
export function scale(m: number[], sx: number, sy?: number, sz?: number): number[] {
    if (sy === undefined) {
        if (sz === undefined) {
            sy = sx;
            sz = sx;
        } else {
            sy = 1;
        }
    } else if (sz === undefined) {
        sz = 1;
    }
    return multiply(m, scaling(sx, sy, sz));
}

export function xRotate(m: number[], radians: number): number[] {
    return multiply(m, xRotation(radians));
}

export function yRotate(m: number[], radians: number): number[] {
    return multiply(m, yRotation(radians));
}

export function zRotate(m: number[], radians: number): number[] {
    return multiply(m, zRotation(radians));
}

export function inverse(m: number[]): number[] {
    const inv = new Array(16);

    inv[0] = m[5] * m[10] * m[15] -
        m[5] * m[11] * m[14] -
        m[9] * m[6] * m[15] +
        m[9] * m[7] * m[14] +
        m[13] * m[6] * m[11] -
        m[13] * m[7] * m[10];

    inv[4] = -m[4] * m[10] * m[15] +
        m[4] * m[11] * m[14] +
        m[8] * m[6] * m[15] -
        m[8] * m[7] * m[14] -
        m[12] * m[6] * m[11] +
        m[12] * m[7] * m[10];

    inv[8] = m[4] * m[9] * m[15] -
        m[4] * m[11] * m[13] -
        m[8] * m[5] * m[15] +
        m[8] * m[7] * m[13] +
        m[12] * m[5] * m[11] -
        m[12] * m[7] * m[9];

    inv[12] = -m[4] * m[9] * m[14] +
        m[4] * m[10] * m[13] +
        m[8] * m[5] * m[14] -
        m[8] * m[6] * m[13] -
        m[12] * m[5] * m[10] +
        m[12] * m[6] * m[9];

    inv[1] = -m[1] * m[10] * m[15] +
        m[1] * m[11] * m[14] +
        m[9] * m[2] * m[15] -
        m[9] * m[3] * m[14] -
        m[13] * m[2] * m[11] +
        m[13] * m[3] * m[10];

    inv[5] = m[0] * m[10] * m[15] -
        m[0] * m[11] * m[14] -
        m[8] * m[2] * m[15] +
        m[8] * m[3] * m[14] +
        m[12] * m[2] * m[11] -
        m[12] * m[3] * m[10];

    inv[9] = -m[0] * m[9] * m[15] +
        m[0] * m[11] * m[13] +
        m[8] * m[1] * m[15] -
        m[8] * m[3] * m[13] -
        m[12] * m[1] * m[11] +
        m[12] * m[3] * m[9];

    inv[13] = m[0] * m[9] * m[14] -
        m[0] * m[10] * m[13] -
        m[8] * m[1] * m[14] +
        m[8] * m[2] * m[13] +
        m[12] * m[1] * m[10] -
        m[12] * m[2] * m[9];

    inv[2] = m[1] * m[6] * m[15] -
        m[1] * m[7] * m[14] -
        m[5] * m[2] * m[15] +
        m[5] * m[3] * m[14] +
        m[13] * m[2] * m[7] -
        m[13] * m[3] * m[6];

    inv[6] = -m[0] * m[6] * m[15] +
        m[0] * m[7] * m[14] +
        m[4] * m[2] * m[15] -
        m[4] * m[3] * m[14] -
        m[12] * m[2] * m[7] +
        m[12] * m[3] * m[6];

    inv[10] = m[0] * m[5] * m[15] -
        m[0] * m[7] * m[13] -
        m[4] * m[1] * m[15] +
        m[4] * m[3] * m[13] +
        m[12] * m[1] * m[7] -
        m[12] * m[3] * m[5];

    inv[14] = -m[0] * m[5] * m[14] +
        m[0] * m[6] * m[13] +
        m[4] * m[1] * m[14] -
        m[4] * m[2] * m[13] -
        m[12] * m[1] * m[6] +
        m[12] * m[2] * m[5];

    inv[3] = -m[1] * m[6] * m[11] +
        m[1] * m[7] * m[10] +
        m[5] * m[2] * m[11] -
        m[5] * m[3] * m[10] -
        m[9] * m[2] * m[7] +
        m[9] * m[3] * m[6];

    inv[7] = m[0] * m[6] * m[11] -
        m[0] * m[7] * m[10] -
        m[4] * m[2] * m[11] +
        m[4] * m[3] * m[10] +
        m[8] * m[2] * m[7] -
        m[8] * m[3] * m[6];

    inv[11] = -m[0] * m[5] * m[11] +
        m[0] * m[7] * m[9] +
        m[4] * m[1] * m[11] -
        m[4] * m[3] * m[9] -
        m[8] * m[1] * m[7] +
        m[8] * m[3] * m[5];

    inv[15] = m[0] * m[5] * m[10] -
        m[0] * m[6] * m[9] -
        m[4] * m[1] * m[10] +
        m[4] * m[2] * m[9] +
        m[8] * m[1] * m[6] -
        m[8] * m[2] * m[5];

    const invdet = 1 / (m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12]);

    return emultiply(invdet, inv);
}