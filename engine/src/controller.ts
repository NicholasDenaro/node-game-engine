export interface Controller {
  tick(): Promise<void> | void;

  isControl(binding: string, state: ControllerState): boolean;

  getDetails(binding: string): any | null;
}

export class ControllerBinding<T extends {}> {

  private state: ControllerState = ControllerState.Unheld;
  private duration: number = 0;
  private details?: T = <T>{};

  constructor(private controlName: string) {
  }

  name(): string {
    return this.controlName;
  }

  tick(): void {
    if (this.duration == 0) {
      if (this.state == ControllerState.Press) {
        this.state = ControllerState.Held;
      }
      if (this.state == ControllerState.Release) {
        this.state = ControllerState.Unheld;
      }
    }
    
    this.duration++;
  }

  getDetails(): T {
    return JSON.parse(JSON.stringify(this.details)) as T;
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

  update(state: ControllerState, info?: T): void {
    switch (state) {
      case ControllerState.Press:
        if (this.state != ControllerState.Press && this.state != ControllerState.Held) {
          this.state = ControllerState.Press;
          this.duration = -1;
        }
        break;
      case ControllerState.Release:
        if (this.state != ControllerState.Release && this.state != ControllerState.Unheld) {
          this.state = ControllerState.Release;
          this.duration = -1;
        }
        break;
    }

    if (info) {
      this.details = info;
    }
  }
}

export enum ControllerState { Press, Held, Release, Unheld, Down, Up }