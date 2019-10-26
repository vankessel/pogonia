export interface InputState {
    mouse: {
        pressed: boolean;
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
            movement: { x: 0, y: 0}
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
        input.mouse.movement.x = event.movementX;
        input.mouse.movement.y = event.movementY;
    });

    canvas.addEventListener('mouseup', function (event) {
        input.mouse.pressed = false;
        input.mouse.movement.x = event.movementX;
        input.mouse.movement.y = event.movementY;
    });

    canvas.addEventListener('mousemove', function (event) {
        input.mouse.movement.x = event.movementX;
        input.mouse.movement.y = event.movementY;
    });

    canvas.addEventListener('keydown', function(event) {
        input.keys[event.key] = true;
    });

    canvas.addEventListener('keyup', function(event) {
        input.keys[event.key] = false;
    });

    return input;
}