export interface InputState {
    mouse: {
        pressed: boolean;
        button: number;
        buttons: number;
        lastPosition: {
            x: number;
            y: number;
        };
        position: {
            x: number;
            y: number;
        };
        movement: {
            x: number;
            y: number;
        };
    };
    keys: {
        [key: string]: boolean;
    };
}

export function initInputState(canvas: HTMLCanvasElement): InputState {

    const input: InputState = {
        mouse: {
            pressed: false,
            button: 0,
            buttons: 0,
            lastPosition: {x: 0, y: 0},
            position: {x: 0, y: 0},
            movement: {x: 0, y: 0},
        },
        keys: {
            w: false,
            a: false,
            s: false,
            d: false,
        }
    };

    canvas.addEventListener('mousedown', function (event) {
        input.mouse.pressed = true;
        input.mouse.button = event.button;
        input.mouse.buttons = event.buttons;
        input.mouse.position.x = event.offsetX;
        input.mouse.position.y = event.offsetY;
    });

    canvas.addEventListener('mouseup', function (event) {
        input.mouse.pressed = false;
        input.mouse.button = event.button;
        input.mouse.buttons = event.buttons;
        input.mouse.position.x = event.offsetX;
        input.mouse.position.y = event.offsetY;
    });

    canvas.addEventListener('mousemove', function (event) {
        input.mouse.position.x = event.offsetX;
        input.mouse.position.y = event.offsetY;
    });

    canvas.addEventListener('mouseenter', function () {
        canvas.focus();
    });

    canvas.addEventListener('keydown', function (event) {
        input.keys[event.key] = true;
    });

    canvas.addEventListener('keyup', function (event) {
        input.keys[event.key] = false;
    });

    return input;
}