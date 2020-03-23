/**
 * Represents the state of user input.
 */
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
