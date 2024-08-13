import { Controller, ControllerBinding, ControllerState } from "../controller.js";

export type KeyboardBinding = ControllerBinding<undefined>;

export type KeyBinding = { binding: KeyboardBinding, keys: string[] };

export class KeyboardController implements Controller {

  private controls: { [binding: string]: KeyBinding } = {};
  private inputs: { [key: string]: KeyBinding } = {};
  
  private disabledKeys: string[] = [];

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

  getDetails(binding: string): {} | null {
    return this.binding(binding)?.getDetails();
  }

  binding(binding: string): KeyboardBinding | null {
    return this.controls[binding]?.binding;
  }

  input(key: string): KeyboardBinding | null {
    return this.inputs[key]?.binding;
  }

  tick(): void | Promise<void> {
    const keys = Object.keys(this.controls);
    for (let i = 0; i < keys.length; i++) {
      this.controls[keys[i]]?.binding.tick();
    }
  }

  public addDisabledKey(key: string) {
    if (this.disabledKeys.indexOf(key) == -1) {
      this.disabledKeys.push(key);
    }
  }

  public removeDisabledKey(key: string) {
    if (this.disabledKeys.indexOf(key) >= 0) {
      this.disabledKeys.splice(this.disabledKeys.indexOf(key), 1);
    }
  }

  private onKeyDown(event: KeyboardEvent) {
    this.input(event.key)?.update(ControllerState.Press);
    if (this.disabledKeys.indexOf(event.key) >= 0) {
      event.preventDefault();
      return false;
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    this.input(event.key)?.update(ControllerState.Release);
    if (this.disabledKeys.indexOf(event.key) >= 0) {
      event.preventDefault();
      return false;
    }
  }
}

