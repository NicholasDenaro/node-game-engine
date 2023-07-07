import { Canvas2DView, ControllerBinding, Engine, FixedTickEngine, KeyboardController, Scene, MouseController, Sprite, Sound } from 'game-engine';
import { Player } from './player';

const screenWidth = 240;
const screenHeight = 160;
const scale = 3;

const engine: Engine = new FixedTickEngine(60);

const spriteAssets = require.context('../assets/', false, /\.png$/);
new Sprite('buddy', spriteAssets('./buddy.png'), { spriteWidth: 64, spriteHeight: 96 });
const wavAssets = require.context('../assets/', false, /\.wav$/);
new Sound('start', wavAssets('./GAME_MENU_SCORE_SFX001416.wav'));

async function init() {

  await Sprite.waitForLoad();

  const view = new Canvas2DView(screenWidth, screenHeight, { scale: scale, bgColor: '#BBBBBB' });
  const scene = new Scene(view);
  scene.addController(new KeyboardController(keyMap));
  scene.addController(new MouseController(mouseMap));
  const scenePause = new Scene(view);

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

init();