import { Canvas2DView, ControllerBinding, Engine, FixedTickEngine, KeyboardController, Scene, ControllerState, SpriteEntity, SpritePainter, MouseController, Entity, Sprite, Sound, MMLWaveForm, PainterContext, Stopwatch } from 'game-engine';

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
  ],
  [
    smoothwaveform(none),
    smoothwaveform(piano),
    waveform(none)
  ]
);


function waveform(func: (phase: number) => number): (tone: number, duration: number, index: number) => number {

  return (tone: number, duration: number, index: number) => {
    let phase = tone * index / 44100;

    let val = func(phase);

    return val;
  }
  
}

function sinwave(phase: number): number {
  return Math.sin(phase * 2 * Math.PI);
}

function sawwave(phase: number): number {
  return phase % 1;
}

function squarewave(phase: number): number {
  return Math.round(phase / 2 % 1);
}

function none(): number {
  return 0;
}

function piano(phase: number): number {
  let Y = 0.6 * Math.sin(1 * phase) * Math.exp(-0.0015 * phase);
  Y += 0.4 * Math.sin(2 * phase) * Math.exp(-0.0015 * phase);

  Y += Y * Y * Y;

  Y *= 1 + 16 * phase  * Math.exp(-6 * phase);

  return Y;
}

function smoothwaveform(func: (phase: number) => number): (tone: number, duration: number, index: number) => number {

  return (tone: number, duration: number, index: number) => {
    let phase = tone * index / 44100;
    let val = 0.6 * func(phase) * 0.05 * (1 - index / (duration * 44100));
    val += 0.4 * func(2 * phase) * 0.05 * (1 - index / (duration * 44100));
    val += val * val * val;

    return val;
  }
}

const engine: Engine = new FixedTickEngine(144, true);

class Wall extends SpriteEntity {

  constructor(x: number, y: number, width: number, height: number) {
    super(new SpritePainter(null, { spriteWidth: width, spriteHeight: height }), x, y);
  }

  async tick(engine: Engine, scene: Scene): Promise<void> {
    return Promise.resolve();
  }
}

class MovingBlock extends SpriteEntity {
  indexCount: number = 0;
  constructor(x: number, y: number) {
    super(new SpritePainter(Sprite.Sprites['player']), x, y);
  }

  tick(engine: Engine, scene: Scene): Promise<void> {
    if (engine.isControl('run', ControllerState.Down)) {
      this.move(engine, scene);
    }

    this.move(engine, scene);

    return Promise.resolve();
  }

  move(engine: Engine, scene: Scene) {
    let moved = false;
    const lastX = this.x;
    const lastY = this.y;
    if (engine.isControl('right', ControllerState.Down)) {
      this.x += 0.25;
      moved = true;
      this.flipHorizontal = false;
    }
    if (engine.isControl('left', ControllerState.Down)) {
      this.x -= 0.25;
      moved = true;
      this.flipHorizontal = true;
    }

    if (scene.entitiesByType(Wall).some(wall => wall.collision(this))) {
      this.x = lastX;
    }

    if (engine.isControl('up', ControllerState.Down)) {
      this.y -= 0.25;
      moved = true;
    }
    if (engine.isControl('down', ControllerState.Down)) {
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
  tick(engine: Engine, scene: Scene): Promise<void> {

    const state = engine.controlDetails('interact', scene.getView());
    this.x = state?.x;
    this.y = state?.y;

    if (engine.isControl('action', ControllerState.Press)) {
      if (engine.getActivatedScenes().find(scene => scene.key === 'main') && this.collision(scene.entitiesByType(MovingBlock)[0])) {
        scene.deactivate();
        engine.activateScene('pause');
        Sound.setVolume(0.5);
        loz = Sound.Sounds['loz'].play();
      } else if (engine.getActivatedScenes().find(scene => scene.key === 'pause')) {
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

  draw(ctx: PainterContext) {
    ctx.fillStyle = '#00FFFF';
    ctx.fillRect(0, 0, 16, 16);
  }
}

async function init() {

  await Sprite.waitForLoad();

  const view = new Canvas2DView(screenWidth, screenHeight, { scale: scale, bgColor: '#BBBBBB' });
  const scene = new Scene('main', view);
  engine.addController(new KeyboardController(keyMap));
  engine.addController(new MouseController(mouseMap));
  scene.addEntity(new Blob(30, 30));
  scene.addEntity(new MovingBlock(50, 50));

  // top/bottom
  scene.addEntity(new Wall(0, 0, screenWidth, 1));
  scene.addEntity(new Wall(0, screenHeight - 1, screenWidth, 1));
  scene.addEntity(new Cursor());

  // left/right
  scene.addEntity(new Wall(0, 0, 1, screenHeight));
  scene.addEntity(new Wall(screenWidth - 1, 0, 1, screenHeight));
  engine.addScene(scene);
  scene.activate();


  //Pause
  const v = new Canvas2DView(screenWidth, screenHeight, { scale: scale, bgColor: '#444444' });
  const other = new Scene('pause', v);
  engine.addScene(other);
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
    binding: new ControllerBinding<{ x: number, y: number, dx: number, dy: number }>('interact'),
    buttons: [0],
  }
];

init();