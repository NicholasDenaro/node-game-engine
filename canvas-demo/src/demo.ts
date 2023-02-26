import {Canvas2DView, ControllerBinding, Engine, Entity, FixedTickEngine, KeyboardController, Painter2D, Scene} from 'engine';
import { ControllerState } from 'engine/src/controller';

const engine: Engine = new FixedTickEngine(144);

class MovingBlock extends Entity {
    constructor(private x: number, private y: number, private color: string) {
        super(new Painter2D((ctx: CanvasRenderingContext2D) => this.doPaint(ctx)));
    }

    tick(scene: Scene){
        if (scene.isControl('right', ControllerState.Down)) {
            this.x++;
        }
        if (scene.isControl('left', ControllerState.Down)) {
            this.x--;
        }
        if (scene.isControl('up', ControllerState.Down)) {
            this.y--;
        }
        if (scene.isControl('down', ControllerState.Down)) {
            this.y++;
        }
    }

    private doPaint(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 4, 4);
    }
}

async function init(): Promise<void> {

    const width = 240;
    const height = 160;
    const view = new Canvas2DView(width, height, 120);
    const scene = new Scene(view);
    scene.addController(new KeyboardController({
        'ArrowLeft': new ControllerBinding('left'),
        'ArrowRight': new ControllerBinding('right'),
        'ArrowUp': new ControllerBinding('up'),
        'ArrowDown': new ControllerBinding('down'),
    }));
    const block = new MovingBlock(0, 0, `#${Math.round(Math.random() * 255).toString(16)}${Math.round(Math.random() * 255).toString(16)}${Math.round(Math.random() * 255).toString(16)}`);
    scene.addEntity(block);
    engine.addScene('main', scene);
    scene.activate();

    await engine.start();
    return Promise.resolve();
}

init();