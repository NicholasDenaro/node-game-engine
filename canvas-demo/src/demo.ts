import { Canvas2DView, ControllerBinding, Engine, FixedTickEngine, KeyboardController, Scene, ControllerState, SpriteEntity, SpritePainter, MouseController, Entity, Sprite, Sound, MMLWaveForm } from 'game-engine';

const screenWidth = 240;
const screenHeight = 160;
const scale = 3;
new Sprite('player', require('./assets/player.png').default, { spriteWidth: 24, spriteHeight: 32, spriteOffsetX: 16, spriteOffsetY: 24 });
new Sprite('cursor', require('./assets/crosshair.png').default, { spriteWidth: 16, spriteHeight: 16, spriteOffsetX: 8, spriteOffsetY: 8 });
new Sound('weewoo', require('./assets/sfxR07.wav').default);
new Sound('woopwoop', require('./assets/GAME_MENU_SCORE_SFX001769.wav').default);

// https://www.gaiaonline.com/guilds/viewtopic.php?page=1&t=23690909#354075091
new MMLWaveForm('loz', [
  't140l16o3f8o4crcrcro3f8o4crcrcro3f8o4crcrcro3f8o4crcro3cre8o4crcrcro3e8o4crcrcro3e8o4crcrcro3e8o4crcro3c8f8o4crcrcro3f8o4crcrcro3f8o4crcrcro3f8o4crcro3cro3e8o4crcrcro3e8o4crcrcro3e8o4crcrcro3e8o4crcrc8o3drardraro2gro3gro2gro3grcro4cro3cro4cro2aro3aro2aro3aro3drardraro2gro3gro2gro3grcro4cro3cro4cro2aro3aro2aro3aro3drardraro2gro3gro2gro3grcro4cro3cro4cro2aro3aro2aro3aro3drararrrdrararrrcrbrbrrrcrbrbrrrerarrrarerarrrarerg#rg#rg#rg#rrre&er',
  't140l16o5frarb4frarb4frarbr>erd4<b8>cr<brgre2&e8drergre2&e4frarb4frarb4frarbr>erd4<b8>crer<brg2&g8brgrdre2&e4r1r1frgra4br>crd4e8frg2&g4r1r1<f8era8grb8ar>c8<br>d8cre8drf8er<b>cr<ab1&b2r4e&e&er',
  't140l16r1r1r1r1r1r1r1r1o4drerf4grarb4>c8<bre2&e4drerf4grarb4>c8dre2&e4<drerf4grarb4>c8<bre2&e4d8crf8erg8fra8grb8ar>c8<br>d8crefrde1&e2r4',
]);

const engine: Engine = new FixedTickEngine(144);

class Wall extends SpriteEntity {

  constructor(x: number, y: number, width: number, height: number) {
    super(new SpritePainter(null, { spriteWidth: width, spriteHeight: height }), x, y);
  }

  async tick(scene: Scene): Promise<void> {
    return Promise.resolve();
  }
}

class MovingBlock extends SpriteEntity {
  indexCount: number = 0;
  constructor(x: number, y: number) {
    super(new SpritePainter(Sprite.Sprites['player']), x, y);
  }

  tick(scene: Scene): Promise<void> {
    if (scene.isControl('run', ControllerState.Down)) {
      this.move(scene);
    }

    this.move(scene);

    return Promise.resolve();
  }

  move(scene: Scene) {
    let moved = false;
    const lastX = this.x;
    const lastY = this.y;
    if (scene.isControl('right', ControllerState.Down)) {
      this.x += 0.25;
      moved = true;
      this.flipHorizontal = false;
    }
    if (scene.isControl('left', ControllerState.Down)) {
      this.x -= 0.25;
      moved = true;
      this.flipHorizontal = true;
    }

    if (scene.entitiesByType(Wall).some(wall => wall.collision(this))) {
      this.x = lastX;
    }

    if (scene.isControl('up', ControllerState.Down)) {
      this.y -= 0.25;
      moved = true;
    }
    if (scene.isControl('down', ControllerState.Down)) {
      this.y += 0.25;
      moved = true;
    }

    if (scene.entitiesByType(Wall).some(wall => wall.collision(this))) {
      this.y = lastY;
    }

    if (moved) {
      this.indexCount++;
      if (this.indexCount == 32) {
        this.indexCount = 0;
        this.imageIndex++;
        if (this.imageIndex == 4) {
          this.imageIndex = 0;
        }
      }
    } else {
      this.imageIndex = 0;
    }
  }
}

let loz: { stop: () => void };
class Cursor extends SpriteEntity {
  constructor() {
    super(new SpritePainter(Sprite.Sprites['cursor']));
  }
  tick(scene: Scene): Promise<void> {

    const state = scene.constrolDetails('interact');
    this.x = state?.x;
    this.y = state?.y;

    if (scene.isControl('action', ControllerState.Press)) {
      if (engine.sceneKey(scene) === 'main' && this.collision(scene.entitiesByType(MovingBlock)[0])) {
        scene.deactivate();
        engine.activateScene('pause');
        loz = Sound.Sounds['loz'].play();
      } else if (engine.sceneKey(scene) === 'pause') {
        scene.deactivate();
        engine.activateScene('main');
        Sound.Sounds['woopwoop'].play();
        loz.stop();
      }
    }

    return Promise.resolve();
  }
}

class Blob extends SpriteEntity {
  constructor(x: number, y: number) {
    super(new SpritePainter((ctx) => this.draw(ctx), { spriteWidth: 16, spriteHeight: 16 }), x, y);
  }

  tick() {
    return Promise.resolve();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#00FFFF';
    ctx.fillRect(0, 0, 16, 16);
  }
}

async function init() {

  await Sprite.waitForLoad();

  const view = new Canvas2DView(screenWidth, screenHeight, { scale: scale, bgColor: '#BBBBBB' });
  const scene = new Scene(view);
  scene.addController(new KeyboardController(keyMap));
  scene.addController(new MouseController(mouseMap));
  scene.addEntity(new Blob(30, 30));
  scene.addEntity(new MovingBlock(50, 50));

  // top/bottom
  scene.addEntity(new Wall(0, 0, screenWidth, 1));
  scene.addEntity(new Wall(0, screenHeight - 1, screenWidth, 1));
  scene.addEntity(new Cursor());

  // left/right
  scene.addEntity(new Wall(0, 0, 1, screenHeight));
  scene.addEntity(new Wall(screenWidth - 1, 0, 1, screenHeight));
  engine.addScene('main', scene);
  scene.activate();


  //Pause
  const v = new Canvas2DView(screenWidth, screenHeight, { scale: scale, bgColor: '#444444' });
  const other = new Scene(v);
  engine.addScene('pause', other);
  other.addController(new KeyboardController(keyMap));
  other.addController(new MouseController(mouseMap));
  other.addEntity(new Cursor());

  await engine.start();
}

const keyMap = [
  {
    binding: new ControllerBinding<undefined>('left'),
    keys: ['ArrowLeft', 'a', 'A'],
  },
  {
    binding: new ControllerBinding<undefined>('right'),
    keys: ['ArrowRight', 'd', 'D'],
  },
  {
    binding: new ControllerBinding<undefined>('up'),
    keys: ['ArrowUp', 'w', 'W'],
  },
  {
    binding: new ControllerBinding<undefined>('down'),
    keys: ['ArrowDown', 's', 'S'],
  },
  {
    binding: new ControllerBinding<undefined>('run'),
    keys: ['Shift'],
  },
  {
    binding: new ControllerBinding<undefined>('action'),
    keys: [' '],
  },
];

const mouseMap = [
  {
    binding: new ControllerBinding<{ x: number, y: number }>('interact'),
    buttons: [0],
  }
];

init();