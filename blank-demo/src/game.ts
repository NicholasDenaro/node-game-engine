import { Canvas2DView, ControllerBinding, Engine, FixedTickEngine, GamepadController, KeyboardController, Scene, MouseController, Sprite, Sound, ControllerState } from 'game-engine';
import { Player } from './player.js';

const screenWidth = 240;
const screenHeight = 160;
const scale = 3;
export const FPS = 60;

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

const engine: Engine = new FixedTickEngine(FPS);

export const spriteAssets = require.context('../assets/', true, /\.png$/);
const wavAssets = require.context('../assets/', true, /\.wav$/);

if (wavAssets('./premade/GAME_MENU_SCORE_SFX001416.wav')) {
  new Sound('start', wavAssets('./premade/GAME_MENU_SCORE_SFX001416.wav'));
}

new Sprite('buddy', spriteAssets('./buddy.png'), { spriteWidth: 64, spriteHeight: 96 });
new Sprite('button', spriteAssets('./button.png'), { spriteWidth: 64, spriteHeight: 64 });
new Sprite('bark', spriteAssets('./bark.png'), { spriteWidth: 64, spriteHeight: 64 });

async function init() {

  await Sprite.waitForLoad();

  await Sound.waitForLoad();

  engine.addController(new KeyboardController(keyMap));
  engine.addController(new MouseController(mouseMap));
  engine.addController(new GamepadController(gamepadMap));

  const view = new Canvas2DView(screenWidth, screenHeight, { scale: scale, bgColor: '#BBBBBB' });
  const scene = new Scene('main', view);
  const scenePause = new Scene('pause', view);

  engine.addScene(scene);
  engine.addScene(scenePause);

  scene.addEntity(new Player());

  engine.addScene(scene);

  engine.addScene(scenePause);

  engine.addActionPre('pause', () => {
    if (engine.isControl('action', ControllerState.Press) || engine.isControl('interact1', ControllerState.Press)) {
      if (engine.getActivatedScenes().some(scene => scene.key === 'main')) {
        engine.switchToScene('pause');
      } else {
        engine.switchToScene('main');
      }
    }
  });

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
    binding: new ControllerBinding<undefined>('leftTurn'),
    keys: ['q', 'Q'],
  },
  {
    binding: new ControllerBinding<undefined>('rightTurn'),
    keys: ['e', 'E'],
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
    binding: new ControllerBinding<{ x: number, y: number, dx: number, dy: number }>('interact1'),
    buttons: [0],
  },
  {
    binding: new ControllerBinding<{ x: number, y: number, dx: number, dy: number }>('interact2'),
    buttons: [2],
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