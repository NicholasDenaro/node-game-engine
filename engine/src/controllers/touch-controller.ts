import { Controller, ControllerBinding, ControllerState } from '../controller.js';

export type TouchDetail = {x: number, y: number};

export type TouchBinding = ControllerBinding<TouchDetail>;

export type ButtonBinding = { binding: TouchBinding, buttons: number[] };

export class TouchController implements Controller {

  private controls: { [binding: string]: ButtonBinding } = {};
  private inputs: { [key: number]: ButtonBinding } = {};
  private delayRelease: { [key: number]: number } = {};

  constructor(keyMap: ButtonBinding[]) {
    for (let i = 0; i < keyMap.length; i++) {
      this.controls[keyMap[i].binding.name()] = keyMap[i];
      keyMap[i].buttons.forEach(button => {
        this.inputs[button] = keyMap[i];
        this.delayRelease[button] = 0
      })
    }
    addEventListener('touchstart', (event: TouchEvent) => this.onMouseDown(event));
    addEventListener('touchend', (event: TouchEvent) => this.onMouseUp(event));
    addEventListener('touchmove', (event: TouchEvent) => this.onMouseMove(event));
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

  getDetails(binding: string): TouchDetail | null {
    return this.binding(binding)?.getDetails() || null;
  }

  binding(binding: string): TouchBinding | null {
    return this.controls[binding]?.binding;
  }

  input(key: number): TouchBinding | null {
    return this.inputs[key]?.binding;
  }


  tick(): void | Promise<void> {
    const delayKeys = Object.keys(this.delayRelease) as unknown as number[];
    for (let i = 0; i < delayKeys.length; i++) {
      if (this.delayRelease[delayKeys[i]] === 1) {
        // console.log(`release touch: ${delayKeys[i]}`);
        this.input(delayKeys[i])?.update(ControllerState.Release, null);
      }

      this.delayRelease[delayKeys[i]]--;
    }
    const keys = Object.keys(this.controls);
    for (let i = 0; i < keys.length; i++) {
      this.controls[keys[i]]?.binding.tick();
    }
    for (let i = 0; i < keys.length; i++) {
      const binding = this.controls[keys[i]]?.binding;
      const details: TouchDetail = binding.getDetails();
      binding.update(binding.getState(), { x: details.x, y: details.y});
    }
  }

  private onMouseDown(event: TouchEvent) {
    // console.log('touch start');
    // console.log(event);
    for (let i = 0; i <event.touches.length; i++) {
      const touch = event.touches[i];
      this.input(i)?.update(ControllerState.Press, { x: touch.clientX, y: touch.clientY });
    }

    event.preventDefault();
    event.stopPropagation();
  }

  private onMouseUp(event: TouchEvent) {
    // console.log('touch end');
    // console.log(event);
    let i;
    for (i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i].identifier;
      this.delayRelease[i] = 2;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  private onMouseMove(event: TouchEvent) {
    // console.log('touch move');
    // console.log(event);
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      this.input(i)?.update(ControllerState.Press, { x: touch.clientX, y: touch.clientY });
    }

    event.preventDefault();
    event.stopPropagation();
  }
}

