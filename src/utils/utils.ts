import { Updater } from "../scene";
import { getViewportInfo } from "./glUtils";
import { InputState } from "../input";
import { Camera } from "../camera";
import { Mat4 } from "gl-transform";


/**
 * Initialize and return an input state object that is modified on input events.
 * @param canvas: The canvas element.
 */
export function initInputState(canvas: HTMLCanvasElement): InputState {
    const input: InputState = {
        mouse: {
            pressed: false,
            button: 0,
            buttons: 0,
            lastPosition: { x: 0, y: 0 },
            position: { x: 0, y: 0 },
            movement: { x: 0, y: 0 },
        },
        keys: {
            w: false,
            a: false,
            s: false,
            d: false,
        },
    };

    canvas.addEventListener('mousedown', (event) => {
        input.mouse.pressed = true;
        input.mouse.button = event.button;
        input.mouse.buttons = event.buttons;
        input.mouse.position.x = event.offsetX;
        input.mouse.position.y = event.offsetY;
    });

    canvas.addEventListener('mouseup', (event) => {
        input.mouse.pressed = false;
        input.mouse.button = event.button;
        input.mouse.buttons = event.buttons;
        input.mouse.position.x = event.offsetX;
        input.mouse.position.y = event.offsetY;
    });

    canvas.addEventListener('mousemove', (event) => {
        input.mouse.position.x = event.offsetX;
        input.mouse.position.y = event.offsetY;
    });

    canvas.addEventListener('keydown', (event) => {
        input.keys[event.key] = true;
    });

    canvas.addEventListener('keyup', (event) => {
        input.keys[event.key] = false;
    });

    return input;
}

export function initStandardCameraController(gl: WebGL2RenderingContext, camera: Camera): Updater<Camera> {
    const viewportInfo = getViewportInfo(gl);
    const xFovPerPixel = camera.xFov / viewportInfo.width;
    const yFovPerPixel = camera.xFov / (camera.aspect * viewportInfo.height);
    const sensitivity = 2;
    return new Updater(camera, (cameraToUpdate: Camera, deltaTime: number, input: InputState): void => {
        if (input.mouse.pressed && input.mouse.button === 0) {
            cameraToUpdate.yaw -= input.mouse.movement.x * xFovPerPixel * sensitivity;
            cameraToUpdate.pitch -= input.mouse.movement.y * yFovPerPixel * sensitivity;
            // Bound yaw
            if (cameraToUpdate.yaw > Math.PI) {
                cameraToUpdate.yaw -= 2 * Math.PI;
            } else if (cameraToUpdate.yaw <= -Math.PI) {
                cameraToUpdate.yaw += 2 * Math.PI;
            }
            // Clamp pitch
            if (cameraToUpdate.pitch > Math.PI / 2) {
                cameraToUpdate.pitch = Math.PI / 2;
            } else if (cameraToUpdate.pitch < -Math.PI / 2) {
                cameraToUpdate.pitch = -Math.PI / 2;
            }
            const tx = cameraToUpdate.transform[12];
            const ty = cameraToUpdate.transform[13];
            const tz = cameraToUpdate.transform[14];
            cameraToUpdate.transform = Mat4.multiply(
                Mat4.rotationYMatrix(cameraToUpdate.yaw),
                Mat4.rotationXMatrix(cameraToUpdate.pitch),
            );
            cameraToUpdate.transform[12] = tx;
            cameraToUpdate.transform[13] = ty;
            cameraToUpdate.transform[14] = tz;
        }

        if (input.keys.w) {
            cameraToUpdate.translate(0, 0, -deltaTime);
        }
        if (input.keys.a) {
            cameraToUpdate.translate(-deltaTime, 0, 0);
        }
        if (input.keys.s) {
            cameraToUpdate.translate(0, 0, deltaTime);
        }
        if (input.keys.d) {
            cameraToUpdate.translate(deltaTime, 0, 0);
        }
    });
}
