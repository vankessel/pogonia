import * as $ from 'jquery';
import * as prim from './primitives'
import * as glu from './webglUtils';
import vertexShaderSource from './shaders/vertex.glsl';
import frgmntShaderSource from './shaders/frgmnt.glsl';
import skyboxVertexShaderSource from './shaders/skybox/vertex.glsl';
import skyboxFrgmntShaderSource from './shaders/skybox/frgmnt.glsl';
import Camera from './camera';
import {BigF, Cube} from "./primitives";

function main(): void {
    // Set up context
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        alert("Could not create context.");
        return;
    }

    // Enable culling and set depth function
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.depthFunc(gl.LEQUAL);

    // Set up resizing
    glu.resizeCanvas(gl);
    new window.ResizeObserver(function (): void {
        glu.resizeCanvas(gl);
    }).observe(canvas);

    // Create program
    const program = glu.createProgramFromSource(gl, vertexShaderSource, frgmntShaderSource);

    // Create skybox program
    const skyboxProgram = glu.createProgramFromSource(gl, skyboxVertexShaderSource, skyboxFrgmntShaderSource);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // SKYBOX
    const skybox = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+0, 0, gl.RGBA, 1, 1, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+1, 0, gl.RGBA, 1, 1, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+2, 0, gl.RGBA, 1, 1, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+3, 0, gl.RGBA, 1, 1, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+4, 0, gl.RGBA, 1, 1, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+5, 0, gl.RGBA, 1, 1, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

    const image1 = new Image();
    image1.src = '/assets/skybox/front.jpg';
    image1.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+0, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+1, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+2, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+3, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+4, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+5, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);

    });
    console.log(image1);

    gl.depthMask(false);
    gl.useProgram(skyboxProgram);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox);

    const skyboxBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxBuffer);
    const skyboxAttribLoc = gl.getAttribLocation(skyboxProgram, 'a_position');
    gl.vertexAttribPointer(
        skyboxAttribLoc,
        Cube.attribOptions.size,
        Cube.attribOptions.type,
        Cube.attribOptions.normalize,
        Cube.attribOptions.stride,
        Cube.attribOptions.offset
    );
    gl.enableVertexAttribArray(skyboxAttribLoc);

    const skyboxWorldToViewLoc = gl.getUniformLocation(skyboxProgram, 'u_worldToView');
    const skyboxProjectionLoc = gl.getUniformLocation(skyboxProgram, 'u_projection');
    const camera = new Camera(Math.PI/2, 3/4, 0.1, 4);
    gl.uniformMatrix4fv(skyboxWorldToViewLoc, true, camera.worldToView);
    gl.uniformMatrix4fv(skyboxProjectionLoc, true, camera.projection);

    gl.bufferData(gl.ARRAY_BUFFER, Cube.positionArray, gl.STATIC_DRAW);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 8);
    const skyboxIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array([
        0, 1, 2, 3, 4, 5, 6, 7, 0, 1
    ]), gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLE_STRIP, 10, gl.UNSIGNED_BYTE, 0);


    // MAIN
    // Use main program
    gl.useProgram(program);

    // Create and bind buffer for vertices
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Get the attribute location where we will use the position buffer
    const positionAttribLoc = gl.getAttribLocation(program, 'a_position');

    // Describe how the attrib will access the buffer
    const size = 3; // TODO: Specific to the primitive
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(
        positionAttribLoc, size, type, normalize, stride, offset,
    );
    gl.enableVertexAttribArray(positionAttribLoc);

    const bigf = new BigF();

    const modelToWorldLoc = gl.getUniformLocation(program, 'u_modelToWorld');
    const worldToViewLoc = gl.getUniformLocation(program, 'u_worldToView');
    const projectionLoc = gl.getUniformLocation(program, 'u_projection');
    camera.translate(0, 0, 1);
    console.log(bigf.transform);
    console.log(camera.worldToView);
    console.log(camera.projection);
    gl.uniformMatrix4fv(modelToWorldLoc, true, bigf.transform);
    gl.uniformMatrix4fv(worldToViewLoc, true, camera.worldToView);
    gl.uniformMatrix4fv(projectionLoc, true, camera.projection);

    // Fill the buffer with our data
    prim.BigF.setGeometry(gl);

    gl.drawArrays(gl.TRIANGLES, 0, 16 * 6); // TODO: Specific to the primitive
}

$(function () {
    main();
});