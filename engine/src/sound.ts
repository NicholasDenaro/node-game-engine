export class Sound {
  static Sounds: { [key: string]: Sound } = {};
  static Contexts: { [key: string]: {context: AudioContext, buffer?: AudioBuffer, ready: boolean} } = {};

  constructor(private name: string, private path: string, private loop: boolean = false) {
    Sound.Sounds[name] = this;
    Sound.Contexts[name] = { context: new AudioContext(), ready: false };

    fetch(path).then(response => {
      response.arrayBuffer().then(arrayBuffer => {
        Sound.Contexts[name].context.decodeAudioData(arrayBuffer, buffer => {
          Sound.Contexts[name].buffer = buffer;
          Sound.Contexts[name].ready = true;
          console.log(`Sound loaded: ${name}`);
        });
      });
    });
  }

  private static volume = 1;
  static setVolume(vol: number) {
    Sound.volume = vol;
  }

  static getVolume() {
    return Sound.volume;
  }

  static async waitForLoad() {
    await Promise.all(Object.values(Sound.Contexts).map(sound => new Promise<void>((resolve, reject) => {
      const interval = window.setInterval(() => {
        if (sound.ready) {
          window.clearInterval(interval);
          resolve();
        }
      }, 1);
    })));
  }

  play(): {stop: () => void, volume: (val: number) => void} {
    if (!Sound.Contexts[this.name]?.ready) {
      return;
    }

    const gain = Sound.Contexts[this.name].context.createGain();
    gain.gain.value = Sound.volume;
    gain.connect(Sound.Contexts[this.name].context.destination);

    const source = Sound.Contexts[this.name].context.createBufferSource();
    source.buffer = Sound.Contexts[this.name].buffer;
    source.loop = this.loop;
    source.connect(gain);
    source.start(0);

    return {
      stop: () => source.stop(),
      volume: (val) => gain.gain.value = val,
    }
  }
}