import { Engine } from '../engine.js';
import { Sprite } from '../impls/sprite.js';
import { TileMapAnimated } from '../impls/tile-map-animated.js';
import { TileMap } from '../impls/tile-map.js';
import { Scene } from '../scene.js';
import { View } from '../view.js';
import { Rectangle } from './rectangle.js';

export abstract class TiledLoader {
  async createSceneFromTMX(engine: Engine, fileName: string, name: string, view: View): Promise<Scene> {
    const parser = new DOMParser();
    const data = await fetch(await this.mapData(fileName)).then(response => response.text());
    const docMap = parser.parseFromString(data, 'text/xml');
    const map = docMap.querySelector('map');
    //console.log(map);

    const mapwidth = Number.parseInt(map.getAttribute('width'));
    const mapheight = Number.parseInt(map.getAttribute('height'));
    const tilewidth = Number.parseInt(map.getAttribute('tilewidth'));
    const tileheight = Number.parseInt(map.getAttribute('tileheight'));

    console.log(`loading map: ${name} ${fileName}`);
    console.log(`map dimensions: ${mapwidth} ${mapheight} ${tilewidth} ${tileheight}`);

    const tilesetsList = [];
    const tilesets = docMap.querySelectorAll('tileset').values();
    let tilesetI;
    while ((tilesetI = tilesets.next()).value) {
      let tile = tilesetI.value as Element;
      const source = tile.getAttribute('source') as string;
      const firstgid = Number.parseInt(tile.getAttribute('firstgid'));
      const tilesetData = await this.getTileData(source);

      tilesetsList.push({ sprite: Sprite.Sprites[source], firstgid: firstgid, ...tilesetData });
    };

    const scene = new Scene(name, view);

    const layers = docMap.querySelectorAll('layer').values();
    let layerI;
    while ((layerI = layers.next()).value) {
      let layer = layerI.value as Element;
      //console.log(layer);
      const propzIndex = layer.querySelector('property[name="zindex"]');
      const zIndex = Number.parseInt(propzIndex.getAttribute('value'));
      //console.log(`zIndex = ${zIndex}`);
      const data = layer.querySelector('data');
      //console.log(data);
      const tiles = data.innerHTML.split(',').map(val => Number.parseInt(val));
      scene.addEntity(new TileMap(tilesetsList, tiles, zIndex, mapwidth, tilewidth, tileheight));
      const animatedTiles = tilesetsList.filter(tileset => tileset.animated);
      for (let animatedTile of animatedTiles) {
        scene.addEntity(new TileMapAnimated(tilesetsList, tiles, zIndex, mapwidth, tilewidth, tileheight, animatedTile.frames, animatedTile.frameIndexSize));
      }
    };


    const objects = docMap.querySelectorAll('objectgroup object').values();
    let objectI;
    while ((objectI = objects.next()).value) {
      let object = objectI.value as Element;
      const bounds = this.getBounds(object);
      let gid = Number.parseInt(object.getAttribute('gid')) ?? 0;
      const startgid = tilesetsList.find(tileset => gid >= tileset.firstgid && gid < tileset.firstgid + tileset.tilecount)?.firstgid ?? 0;
      gid -= startgid - 1;
      this.loadObject(scene, bounds, gid, object);
    };

    return scene;
  }

  async loadTiles(source: string): Promise<{ animated: boolean, frames: number, frameIndexSize: number, tilecount: number }> {
    const parser = new DOMParser();

    const data = await fetch(await this.mapData(`./${source}`)).then(response => response.text());
    const docMap = parser.parseFromString(data, 'text/xml');
    const tileset = docMap.querySelector('tileset');
    const image = tileset.querySelector('image');

    const path = image.getAttribute('source').slice(1);
    console.log(`Loading sprite for ${source}`);
    new Sprite(source, await this.spriteData(path), { spriteWidth: Number.parseInt(tileset.getAttribute('tilewidth')), spriteHeight: Number.parseInt(tileset.getAttribute('tileheight')) });

    await Sprite.waitForLoad();

    const animated = tileset.querySelector('property[name="animated"]')?.getAttribute('value') === 'true';
    const frames = Number.parseInt(tileset.querySelector('property[name="frames"]')?.getAttribute('value') ?? '0');
    const frameIndexSize = Number.parseInt(tileset.querySelector('property[name="frameIndexSize"]')?.getAttribute('value') ?? '0');
    const tilecount = Number.parseInt(tileset.getAttribute('tilecount'));
    return {
      animated, frames, frameIndexSize, tilecount
    }
  }

  tilesetData: { [key: string]: { animated: boolean, frames: number, frameIndexSize: number, tilecount: number } } = {};
  async getTileData(source: string): Promise<{ animated: boolean, frames: number, frameIndexSize: number, tilecount: number }> {
    if (!Sprite.Sprites[source]) {
      this.tilesetData[source] = await this.loadTiles(source);
    }

    return this.tilesetData[source];
  }

  abstract spriteData(path: string): string;

  abstract mapData(path: string): string;

  abstract loadObject(scene: Scene, bounds: Rectangle, gid: number, object: Element): void;

  getProperty(object: Element, prop: string): string {
    return object.querySelector(`property[name="${prop}"]`)?.getAttribute('value');
  }

  getBounds(object: Element): Rectangle {
    const bounds = new Rectangle(Math.floor(Number.parseInt(object.getAttribute('x'))),
      Math.floor(Number.parseInt(object.getAttribute('y'))),
      Math.floor(Number.parseInt(object.getAttribute('width'))),
      Math.floor(Number.parseInt(object.getAttribute('height')))
    );

    // The object is a tile, and so the bounds need to be offset
    if (object.hasAttribute('gid')) {
      bounds.y -= bounds.height;
    }

    return bounds;
  }
}