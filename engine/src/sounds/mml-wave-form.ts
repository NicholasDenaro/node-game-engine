import { Sound } from "../sound.js";

export class MMLWaveForm extends Sound {
  private contexts: {audCtx: AudioContext, buf: AudioBuffer}[] = [];
  constructor(name: string, mml: string[], private waveFunction: ((tone: number, duration: number, i: number) => number)[] = undefined) {
    super(name, null);

    const matcher = new RegExp('(?<note>[a-grA-GR][+#-]?[0-9]*\\.?(&[a-grA-GR][+#-]?[0-9]*\\.?)*)|(?<octave>[<>]|o[1-8])|(?<length>l[0-9]+\\.?)|(?<tempo>t[0-9]+\\.?)', 'g');
    let matches;
    mml.forEach((track, trackIndex) => {
      matches = track.matchAll(matcher);
      let match;
      let octave = 4;
      let length = 1;
      let tempo = 120;
      let audCtx = new AudioContext();
      const notes = [];
      while (!(match = matches.next()).done) {
        let val: { note?: string, octave?: string, length?: string, tempo?: string } = match.value.groups;
        if (val.octave) {
          if (val.octave === '>') {
            octave++;
          } else if (val.octave === '<') {
            octave--;
          } else {
            octave = Number.parseInt(val.octave.substring(1));
          }
        } else if (val.tempo) {
          tempo = Number.parseInt(val.tempo.substring(1));
        } else if (val.length) {
          length = Number.parseInt(val.length.substring(1));
        } else {
          let noteSegment = val.note;
          const ties = noteSegment.split('&');

          let note = ties[0].match(/[a-grA-GR][+#-]?/)[0];
          let duration = 0;
          ties.forEach(tie => {
            let noteLength = Number.parseInt(tie.match(/[0-9]*/g)[1]) || length;
            duration += (1 / noteLength) * (60 / (tempo / 4));
          });

          let tone = this.getTone(note, octave);
          notes.push({ tone, duration });
        }
      }

      let totalDuration = 0;
      notes.forEach(note => {
        totalDuration += note.duration * 44100;
      });

      const buf = audCtx.createBuffer(1, totalDuration, 44100);
      this.contexts.push({audCtx, buf});
      const chData = buf.getChannelData(0);

      let index = 0;
      notes.forEach(note => {
        for (let i = 0; i < note.duration * 44100; i++) {
          chData[index] = this.getWave(trackIndex, note.tone, note.duration, i);
          index++;
        }
      });
    });
    
  }

  getWave(trackIndex: number, tone: number, duration: number, i: number): number {
    if (this.waveFunction) {
      return this.waveFunction[trackIndex](tone, duration, i);
    }

    let t = i / 44100 * Math.PI * 2;
    let val = 0.6 * Math.sin(tone * t) * 0.05 * (1 - i / (duration * 44100));
    val += 0.4 * Math.sin(2 * tone * t) * 0.05 * (1 - i / (duration * 44100));
    val += val * val * val;

    return val;
  }

  override play(): { stop: () => void, volume: (val: number) => void } {
    const stops: AudioBufferSourceNode[] = [];
    this.contexts.forEach(aud => {
      const source = aud.audCtx.createBufferSource();
      stops.push(source);
      source.buffer = aud.buf;
      source.connect(aud.audCtx.destination);
      source.start(0);
    });

    const stopFunc = {
      stop: () => stops.forEach(stop => stop.stop(0)),
      volume: (val: number) => {}
    };

    console.log(stopFunc);

    return stopFunc;
  }

  private getTone(note: string, octave: number) {
    let shift = octave - 4;
    let tone;
    switch (note) {
      case "c-":
        tone = 247;
        break;
      case "c":
        tone = 262;
        break;
      case "c+":
        tone = 277;
        break;
      case "d-":
        tone = 277;
        break;
      case "d":
        tone = 294;
        break;
      case "d+":
        tone = 311;
        break;
      case "e-":
        tone = 311;
        break;
      case "e":
        tone = 330;
        break;
      case "e+":
        tone = 349;
        break;
      case "f-":
        tone = 330;
        break;
      case "f":
        tone = 349;
        break;
      case "f+":
        tone = 370;
        break;
      case "g-":
        tone = 370;
        break;
      case "g":
        tone = 392;
        break;
      case "g+":
        tone = 415;
        break;
      case "a-":
        tone = 415;
        break;
      case "a":
        tone = 440;
        break;
      case "a+":
        tone = 466;
        break;
      case "b-":
        tone = 466;
        break;
      case "b":
        tone = 494;
        break;
      case "b+":
        tone = 523;
        break;
      default:
        tone = 0;
        break;
    }

    if (shift > 0) {
      tone = tone << shift;
    }
    else if (shift < 0) {
      tone = tone >> 4 - octave;
    }

    return tone;
  }
}