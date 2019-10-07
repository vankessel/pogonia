import * as $ from 'jquery';
import * as glu from './webglUtils';
import vertexShaderSource from './vertex.glsl';
import frgmntShaderSource from './frgmnt.glsl';

function main(): void {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        alert("No webgl context.");
        return;
    }
    glu.resizeCanvas(gl);

    new window.ResizeObserver(function (): void {
        glu.resizeCanvas(gl);
    }).observe(canvas);

    // let vertexShaderSource = null,
    //     frgmntShaderSource = null;
    //
    // const vertexPromise = $.get('vertex.glsl', null, function (data) {
    //         vertexShaderSource = data;
    //     }, 'text'),
    //     frgmntPromise = $.get('frgmnt.glsl', null, function (data) {
    //         frgmntShaderSource = data;
    //     }, 'text');
    //
    // await Promise.all([vertexPromise, frgmntPromise]);

    const vertexShader = glu.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const frgmntShader = glu.createShader(gl, gl.FRAGMENT_SHADER, frgmntShaderSource);
    if(!vertexShader || !frgmntShader) {
        alert("Could not load shaders");
        return;
    }

    const program = glu.createProgram(gl, vertexShader, frgmntShader);
    if(!program) {
        alert("Could not load program");
        return;
    }

    // START: Set up position buffer and attrib
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
        0, 0,
        0, 1,
        1, 0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    const positionAttribLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttribLocation);

    const size = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(
        positionAttribLocation, size, type, normalize, stride, offset,
    );
    // END: Set up position buffer and attrib

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

$(function () {
    main();
});