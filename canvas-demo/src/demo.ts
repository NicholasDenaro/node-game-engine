import { Canvas2DView, ControllerBinding, Engine, FixedTickEngine, KeyboardController, Scene, ControllerState, SpriteEntity, SpritePainter } from 'game-engine';

const img = require('./assets/player.png');

const engine: Engine = new FixedTickEngine(144);

class Wall extends SpriteEntity {

  constructor(x: number, y: number, width: number, height: number) {
    super(new SpritePainter(null, {spriteWidth: width, spriteHeight: height}), x, y);
  }

  async tick(scene: Scene): Promise<void> {
    return Promise.resolve();
  }
}

class MovingBlock extends SpriteEntity {
  indexCount: number = 0;
  constructor(x: number, y: number) {
    super(new SpritePainter(img.default, { spriteWidth: 24, spriteHeight: 32 }), x, y);
  }

  tick(scene: Scene): Promise<void> {
    let moved = false;
    const lastX = this.x;
    const lastY = this.y;
    if (scene.isControl('right', ControllerState.Down)) {
      this.x += 0.25;
      moved = true;
    }
    if (scene.isControl('left', ControllerState.Down)) {
      this.x -= 0.25;
      moved = true;
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

    if (scene.isControl('action', ControllerState.Down)) {
      
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

    return Promise.resolve();
  }
}

async function init(): Promise<void> {
  const width = 240;
  const height = 160;
  const view = new Canvas2DView(width, height, {dpi: 120, scale: 3});
  const scene = new Scene(view);
  scene.addController(new KeyboardController(keyMap));
  scene.addEntity(new MovingBlock(10, 10));
  // top/bottom
  scene.addEntity(new Wall(0, 0, width, 1));
  scene.addEntity(new Wall(0, height - 1, width, 1));

  // left/right
  scene.addEntity(new Wall(0, 0, 1, height));
  scene.addEntity(new Wall(width - 1, 0, 1, height));
  engine.addScene('main', scene);
  scene.activate();

  document.body.appendChild(view.viewElement());

  await engine.start();
  return Promise.resolve();
}

const keyMap = [
  {
    binding: new ControllerBinding('left'),
    keys: ['ArrowLeft', 'a'],
  },
  {
    binding: new ControllerBinding('right'),
    keys: ['ArrowRight', 'd'],
  },
  {
    binding: new ControllerBinding('up'),
    keys: ['ArrowUp', 'w'],
  },
  {
    binding: new ControllerBinding('down'),
    keys: ['ArrowDown', 's'],
  },
  {
    binding: new ControllerBinding('action'),
    keys: [' '],
  },
]

init();