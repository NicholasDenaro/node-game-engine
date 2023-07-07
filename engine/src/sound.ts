export class Sound {
  static Sounds: {[key: string]: Sound} = {};
  constructor(name: string, private path: string) {
    Sound.Sounds[name] = this;
  }

  private static volume = 1;
  static setVolume(vol: number) {
    Sound.volume = vol;
  }

  play(): {stop: () => void} {
    const audio = new Audio(this.path);
    audio.load();
    audio.play();
    audio.volume = Sound.volume;

    const stopFunc = {
      stop: audio.pause
    }

    return stopFunc;
  }
}