export class Sprite {

  static Sprites: {[key: string]: Sprite} = {};

  private img: HTMLImageElement;
  private columns: number;
  private rows: number
  private loaded = false;

  constructor(public readonly name: string, private path: string, private options: { spriteWidth: number, spriteHeight: number, spriteOffsetX?: number, spriteOffsetY?: number }) {
    Sprite.Sprites[name] = this;
    this.img = new Image();
    this.img.loading = 'eager';
    this.img.src = path;
    this.img.onload = () => {
      console.log(`Sprite loaded: ${this.name}`);
      this.loaded = true;
      this.columns = this.img.naturalWidth / this.options.spriteWidth;
      this.rows = this.img.naturalHeight / this.options.spriteHeight;
    }
  }

  static async waitForLoad() {
    await Promise.all(Object.values(Sprite.Sprites).map(sprite => new Promise<void>((resolve, reject) => {
      const interval = window.setInterval(() => {
        if (sprite.loaded) {
          window.clearInterval(interval);
          resolve();
        }
      }, 1);
    })));
  }

  getGrid() {
    return {rows: this.rows, columns: this.columns};
  }

  getOptions() {
    return this.options;
  }

  getImage() {
    return this.loaded ? this.img : null;
  }
}