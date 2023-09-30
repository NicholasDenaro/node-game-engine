import { Canvas2DView, ControllerBinding, Engine, FixedTickEngine, GamepadController, KeyboardController, Scene, MouseController, Sprite, Sound, Canvas3DView, Model, ModelEntity } from 'game-engine';
import { Player } from './player.js';
import { Player3D } from './player3D.js';
import { Button } from './button.js';

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

async function init() {

  await Sprite.waitForLoad();

  await Sound.waitForLoad();

  const canvas2d = false;

  if (canvas2d) {
    const view = new Canvas2DView(screenWidth, screenHeight, { scale: scale, bgColor: '#BBBBBB' });
    const scene = new Scene(engine, view);
    scene.addController(new KeyboardController(keyMap));
    scene.addController(new MouseController(mouseMap));
    scene.addController(new GamepadController(gamepadMap));
    const scenePause = new Scene(engine, view);

    engine.addScene('main', scene);
    engine.addScene('pause', scenePause);

    scene.addEntity(new Player());
  } else {
    const view = new Canvas3DView(screenWidth, screenHeight, {
      scale: scale,
      preScale3D: true,
      bgColor: '#222222',
      vertexShaderCode: `
      attribute vec4 aVertexPosition;
      attribute vec4 aVertexColor;
      attribute vec2 aTextureCoord;
      attribute vec3 aVertexNormal;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uNormalMatrix;

      varying lowp vec4 vColor;
      varying highp vec2 vTextureCoord;
      varying highp vec3 vLighting;

      uniform lowp vec3 uAmbientLight;
      uniform lowp vec3 uDiretionalLightVector;
      uniform lowp vec3 uDiretionalLightColor;

      void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

        highp vec4 transformedNormal = uNormalMatrix * vec4(normalize(aVertexNormal), 1.0);

        highp float directional = max(dot(transformedNormal.xyz,  normalize(uDiretionalLightVector)), 0.0);
        vLighting = uAmbientLight + (uDiretionalLightColor * directional);
        vColor = aVertexColor;
        vTextureCoord = aTextureCoord;
      }
    `,
      fragmentShaderCode: `
      #ifdef GL_ES
        precision highp float;
      #endif

      varying lowp vec4 vColor;

      varying highp vec2 vTextureCoord;
      varying highp vec3 vLighting;

      uniform sampler2D uSampler;

      uniform vec4 uEnableTexture;

      vec4 ones = vec4(1, 1, 1, 1);
      vec4 zeros = vec4(0, 0, 0, 0);

      void main() {
        vec4 texelColor = vColor + texture2D(uSampler, vTextureCoord) * uEnableTexture; // color OR color + texture
        gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
        if(gl_FragColor.a < 0.1) discard;
      }
    ` });
    const scene = new Scene(engine, view);
    scene.addController(new KeyboardController(keyMap));
    scene.addController(new MouseController(mouseMap));
    scene.addController(new GamepadController(gamepadMap));
    const scenePause = new Scene(engine, view);

    engine.addScene('main', scene);
    engine.addScene('pause', scenePause);

    scene.addEntity(new Button());

    scene.addEntity(new Player3D(new Model(view.getGfx(), {
      textureUrl: spriteAssets('./buddy.png'),
      vertexes: [
        0, 0, 0,
        0, 1.5, 0,
        1, 0, 0,
        1, 1.5, 0,
      ],
      normals: [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
      ], 
      colors: [
        0, 0, 0, 1,
        0, 0, 0, 1,
        0, 0, 0, 1,
        0, 0, 0, 1,
      ], 
      textureCoords: [
        0, 0,
        0, 1,
        1, 0,
        1, 1,
      ],
      triangles: [
        0,1,2, 3,2,1
      ],
      center: {x: 0.5, y: 0.75, z: 0}
    })));
  }

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