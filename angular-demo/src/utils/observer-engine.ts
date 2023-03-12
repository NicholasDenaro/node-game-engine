import { Engine } from "game-engine";

export class ObserverEngine extends Engine {

  start(): Promise<void> | void {
    this.isRunning = true;
  }
  stop(): Promise<void> | void {
    this.isRunning = false;
  }

  private pastStates: { [key: string]: any }[] = [];
  private currentState: { [key: string]: any } = {};
  private futureStates: { [key: string]: any }[] = [];

  resetStates() {
    this.pastStates = [];
  }

  async doTick(saveState: boolean = true): Promise<void> {
    console.log('tick');
    await this.tick();
    console.log('draw');
    await this.draw();

    if (saveState) {
      let keys = Object.keys(this.scenes);
      const state: { [key: string]: any } = {};
      keys.forEach(key => {
        state[key] = {
          entities: this.scenes[key].entitiesSlice().map(entity => entity.save())
        };
      });
      this.pastStates.push(this.currentState);
      this.currentState = state;
      console.log(JSON.stringify(state));
      this.futureStates = [];
    }
  }

  undo() {
    if (this.pastStates.length > 0) {
      const state = this.pastStates.pop()!;
      this.futureStates = [this.currentState, ...this.futureStates];
      this.currentState = state;
      Object.keys(state).forEach(key => this.scenes[key].load(state[key]));

      this.doTick(false);
    }
  }

  redo() {
    if (this.futureStates.length > 0) {
      const state = this.futureStates.splice(0, 1)[0];
      this.pastStates.push(this.currentState);
      this.currentState = state;
      Object.keys(state).forEach(key => this.scenes[key].load(state[key]));
      this.doTick(false);
    }
  }

  hasMoreRedo() {
    return this.futureStates.length > 0;
  }
}