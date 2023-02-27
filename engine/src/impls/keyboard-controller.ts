import { Controller, ControllerBinding, ControllerState } from "../controller.js";

export class KeyboardController implements Controller {
    private controls: {[key: string]: ControllerBinding} = {};
    constructor(private keyMap: {[key: string]: ControllerBinding}) {
        const keys = Object.keys(this.keyMap);
        for (let i = 0; i < keys.length; i++) {
            this.controls[keyMap[keys[i]].name()] = keyMap[keys[i]];
        }
        addEventListener('keydown', (event: KeyboardEvent) => this.onKeyDown(event));
        addEventListener('keyup', (event: KeyboardEvent) => this.onKeyUp(event));
    }

    isControl(binding: string, state: ControllerState): boolean {
        switch(state) {
            case ControllerState.Down:
                return this.controls[binding]?.isDown();
            case ControllerState.Up:
                return this.controls[binding]?.isUp();
        }

        return this.controls[binding]?.is(state);
    }

    tick(): void | Promise<void> {
        const keys = Object.keys(this.keyMap);
        for (let i = 0; i < keys.length; i++) {
            this.keyMap[keys[i]].tick();
        }
    }
    
    private onKeyDown(event: KeyboardEvent) {
        this.keyMap[event.key].update(ControllerState.Press);
    }
    
    private onKeyUp(event: KeyboardEvent) {
        this.keyMap[event.key].update(ControllerState.Release);
    }
}

