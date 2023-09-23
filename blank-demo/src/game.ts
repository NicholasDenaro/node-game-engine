import { Canvas2DView, ControllerBinding, Engine, FixedTickEngine, GamepadController, KeyboardController, Scene, MouseController, Sprite, Sound } from 'game-engine';
import { Player } from './player.js';

const screenWidth = 240;
const screenHeight = 160;
const scale = 3;

declare global {
  interface Window { steam: {
    send: (data: any) => void;
    receive: ((data: any) => void)
   }
  }
}

window.steam?.receive((data: any) => {
  console.log(`got data: ${data}`);
});

setTimeout(() => {
  window.steam?.send('name');
}, 2000);

const engine: Engine = new FixedTickEngine(60);

const spriteAssets = require.context('../assets/', true, /\.png$/);
const wavAssets = require.context('../assets/', true, /\.wav$/);

if (wavAssets('./premade/GAME_MENU_SCORE_SFX001416.wav')) {
  new Sound('start', wavAssets('./premade/GAME_MENU_SCORE_SFX001416.wav'));
}

new Sprite('buddy', spriteAssets('./buddy.png'), { spriteWidth: 64, spriteHeight: 96 });

async function init() {

  await Sprite.waitForLoad();

  await Sound.waitForLoad();

  const view = new Canvas2DView(screenWidth, screenHeight, { scale: scale, bgColor: '#BBBBBB' });
  const scene = new Scene(engine, view);
  scene.addController(new KeyboardController(keyMap));
  scene.addController(new MouseController(mouseMap));
  scene.addController(new GamepadController(gamepadMap));
  const scenePause = new Scene(engine, view);
  view.setOffset(-5, -5);

  engine.addScene('main', scene);
  engine.addScene('pause', scenePause);

  scene.addEntity(new Player());

  engine.switchToScene('main');

  Sound.setVolume(0.1);

  Sound.Sounds['start'].play();

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

const gamepadMap = [
  {
    binding: new ControllerBinding<{value: number}>('button1'),
    buttons: [
      { type: 'buttons', index: 0 },
    ],
  },
  {
    binding: new ControllerBinding<{ value: number }>('button2'),
    buttons: [
      { type: 'buttons', index: 1 },
    ],
  },
  {
    binding: new ControllerBinding<{ value: number }>('axis1'),
    buttons: [
      { type: 'axes', index: 0 },
    ],
  },
  {
    binding: new ControllerBinding<{ value: number }>('axis2'),
    buttons: [
      { type: 'axes', index: 1 },
    ],
  }
];

init();