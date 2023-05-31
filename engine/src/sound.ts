export class Sound {
  static Sounds: {[key: string]: Sound} = {};
  constructor(name: string, private path: string) {
    Sound.Sounds[name] = this;
  }

  play(): {stop: () => void} {
    const audio = new Audio(this.path);
    audio.load();
    audio.play();

    const stopFunc = {
      stop: audio.pause
    }

    return stopFunc;
  }
}