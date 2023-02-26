export interface Controller {
    tick(): Promise<void> | void;

    isControl(binding: string, state: ControllerState): boolean;
}

export class ControllerBinding {
    
    private state: ControllerState = ControllerState.Unheld;
    private duration: number;
    private details = {};

    constructor(private controlName: string) {
    }

    name(): string {
        return this.controlName;
    }

    tick(): void {
        if (this.state == ControllerState.Press) {
            this.state = ControllerState.Held;
        }
        if (this.state == ControllerState.Release) {
            this.state = ControllerState.Unheld;
        }
        this.duration++;
    }

    is(state: ControllerState): boolean {
        return this.state == state;
    }

    isDown(): boolean {
        return this.state == ControllerState.Press || this.state == ControllerState.Held;
    }

    isUp(): boolean {
        return this.state == ControllerState.Release || this.state == ControllerState.Unheld;
    }

    update(state: ControllerState, info?: any | undefined): void {
        switch(state) {
            case ControllerState.Press:
                if (this.state != ControllerState.Press && this.state != ControllerState.Held) {
                    this.state = ControllerState.Press;
                    this.duration = 0;
                }
                break;
            case ControllerState.Release:
                if (this.state != ControllerState.Release && this.state != ControllerState.Unheld) {
                    this.state = ControllerState.Release;
                    this.duration = 0;
                }
                break;
        }

        if (info) {
            this.details = info;
        }
    }
}

export enum ControllerState { Press, Held, Release, Unheld, Down, Up }