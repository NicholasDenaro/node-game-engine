import { Controller, ControllerBinding, ControllerState } from "../controller";

export type MouseDetails = {x: number, y: number};

export type MouseBinding = ControllerBinding<MouseDetails>;

export type ButtonBinding = { binding: MouseBinding, buttons: number[] };

export class MouseController implements Controller {

  private controls: { [binding: string]: ButtonBinding } = {};
  private inputs: { [key: number]: ButtonBinding } = {};

  constructor(keyMap: ButtonBinding[]) {
    for (let i = 0; i < keyMap.length; i++) {
      this.controls[keyMap[i].binding.name()] = keyMap[i];
      keyMap[i].buttons.forEach(button => {
        this.inputs[button] = keyMap[i];
      })
    }
    addEventListener('mousedown', (event: MouseEvent) => this.onMouseDown(event));
    addEventListener('mouseup', (event: MouseEvent) => this.onMouseUp(event));
    addEventListener('mousemove', (event: MouseEvent) => this.onMouseMove(event));
    addEventListener('contextmenu', (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    });
  }

  isControl(binding: string, state: ControllerState): boolean {
    switch (state) {
      case ControllerState.Down:
        return this.binding(binding)?.isDown();
      case ControllerState.Up:
        return this.binding(binding)?.isUp();
    }

    return this.binding(binding)?.is(state);
  }

  getDetails(binding: string): MouseDetails | null {
    return this.binding(binding)?.getDetails() || null;
  }

  binding(binding: string): MouseBinding | null {
    return this.controls[binding]?.binding;
  }

  input(key: number): MouseBinding | null {
    return this.inputs[key]?.binding;
  }

  tick(): void | Promise<void> {
    const keys = Object.keys(this.controls);
    for (let i = 0; i < keys.length; i++) {
      this.controls[keys[i]]?.binding.tick();
    }
  }

  private onMouseDown(event: MouseEvent) {
    this.input(event.button)?.update(ControllerState.Press, {x: event.x, y: event.y});
    event.preventDefault();
    event.stopPropagation();
  }

  private onMouseUp(event: MouseEvent) {
    this.input(event.button)?.update(ControllerState.Release, { x: event.x, y: event.y });
    event.preventDefault();
    event.stopPropagation();
  }

  private onMouseMove(event: MouseEvent) {
    Object.keys(this.controls).forEach(control => this.controls[control].binding.update(ControllerState.Unheld, { x: event.x, y: event.y }));
    event.preventDefault();
    event.stopPropagation();
  }
}

