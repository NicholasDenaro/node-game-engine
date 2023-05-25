import { Controller, ControllerBinding, ControllerState } from "../controller";

export type KeyBinding = { binding: ControllerBinding, keys: string[] };

export class KeyboardController implements Controller {

  private controls: { [binding: string]: KeyBinding } = {};
  private inputs: { [key: string]: KeyBinding } = {};

  constructor(keyMap: KeyBinding[]) {
    for (let i = 0; i < keyMap.length; i++) {
      this.controls[keyMap[i].binding.name()] = keyMap[i];
      keyMap[i].keys.forEach(key => {
        this.inputs[key] = keyMap[i];
      })
    }
    addEventListener('keydown', (event: KeyboardEvent) => this.onKeyDown(event));
    addEventListener('keyup', (event: KeyboardEvent) => this.onKeyUp(event));
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

  binding(binding: string): ControllerBinding | null {
    return this.controls[binding]?.binding;
  }

  input(key: string): ControllerBinding | null {
    return this.inputs[key]?.binding;
  }

  tick(): void | Promise<void> {
    const keys = Object.keys(this.controls);
    for (let i = 0; i < keys.length; i++) {
      this.controls[keys[i]]?.binding.tick();
    }
  }

  private onKeyDown(event: KeyboardEvent) {
    this.input(event.key)?.update(ControllerState.Press);
  }

  private onKeyUp(event: KeyboardEvent) {
    this.input(event.key)?.update(ControllerState.Release);
  }
}

