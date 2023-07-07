import { Controller, ControllerBinding, ControllerState } from "../controller";

export type GamepadBinding = ControllerBinding<{value: number}>;

export type KeyBinding = { binding: GamepadBinding, buttons: {type: string, index:number}[] };

export class GamepadController implements Controller {

  private controls: { [binding: string]: KeyBinding } = {};
  private inputs: { [key: string]: KeyBinding } = {};
  private gamepads: { [key: number]: Gamepad } = {};

  constructor(keyMap: KeyBinding[]) {
    for (let i = 0; i < keyMap.length; i++) {
      this.controls[keyMap[i].binding.name()] = keyMap[i];
      keyMap[i].buttons.forEach(button => {
        this.inputs[`${button.type}-${button.index}`] = keyMap[i];
        console.log(`${button.type}-${button.index}`);
      })
    }
    addEventListener('gamepadconnected', evt => {
      const event = <GamepadEvent>evt;
      this.gamepads[event.gamepad.index] = event.gamepad;
    });
    addEventListener('gamepaddisconnected', evt => {
      const event = <GamepadEvent>evt;
      delete this.gamepads[event.gamepad.index];
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

  getDetails(binding: string): {} | null {
    return this.binding(binding)?.getDetails();
  }

  binding(binding: string): GamepadBinding | null {
    return this.controls[binding]?.binding;
  }

  input(type: string, index: number): GamepadBinding | null {
    return this.inputs[`${type}-${index}`]?.binding;
  }

  tick(): void | Promise<void> {
    for (let index in this.gamepads) {
      const gamepad = this.gamepads[index];
      for (let control of Object.values(this.controls)) {
        let pressed = false;
        let val = 0;
        for (let button of control.buttons) {
          if (button.type == 'buttons') {
            if (gamepad.buttons[button.index].pressed) {
              pressed = true;
            }
          } else if (button.type == 'axes') {
            if (Math.abs(gamepad.axes[button.index]) > 0.2) {
              pressed = true;
              val = gamepad.axes[button.index];
            }
          }
          
        }
        if (pressed) {
          control.binding.update(ControllerState.Press, {value: val});
        }
        if (!pressed) {
          control.binding.update(ControllerState.Release, { value: val });
        }
      }
    }

    const keys = Object.keys(this.controls);
    for (let i = 0; i < keys.length; i++) {
      this.controls[keys[i]]?.binding.tick();
    }
  }
}

