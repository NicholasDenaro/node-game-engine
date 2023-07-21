import { Entity } from "../entity";
import { Painter } from "../painter";
import { Rectangle } from "../utils/rectangle";
import { View } from "../view";

export class Canvas3DView implements View {
  private activated: boolean = false;
  private canvas: HTMLCanvasElement;
  private canvas3D: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gfx: WebGL2RenderingContext;
  private text: HTMLParagraphElement;
  private div: HTMLDivElement;
  public readonly scale: number;
  public readonly dpi: number;
  private bgColor: string;
  private bgColor3D: { r: number, g: number, b: number, a: number };
  program: WebGLProgram;

  constructor(width: number, height: number, options: { scale?: number, bgColor: string }) {
    this.scale = options.scale ?? 1;
    this.dpi = 96 * window.window.devicePixelRatio;
    this.bgColor = options.bgColor ?? '#00FFFFFF';
    this.bgColor3D = {
      r: Number.parseInt(this.bgColor.slice(1,3), 16) / 255,
      g: Number.parseInt(this.bgColor.slice(3,5), 16) / 255,
      b: Number.parseInt(this.bgColor.slice(5,7), 16) / 255,
      a: Number.parseInt(this.bgColor.slice(7,9), 16) / 255,
    }

    this.canvas3D = document.createElement('canvas');
    this.canvas3D.style.display = 'block';
    this.canvas3D.width = width * this.scale;
    this.canvas3D.height = height * this.scale;
    this.canvas3D.style.width = `${this.canvas3D.width * 96 / this.dpi}px`;
    this.canvas3D.style.zIndex = '1';
    this.canvas3D.style.position = 'absolute';
    this.gfx = this.canvas3D.getContext('webgl2');

    this.setupPrograms();

    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.width = width * this.scale;
    this.canvas.height = height * this.scale;
    this.canvas.style.width = `${this.canvas.width * 96 / this.dpi}px`;
    this.ctx = this.canvas.getContext('2d') || {
      canvas: HTMLCanvasElement,
      getContextAttributes(): CanvasRenderingContext2DSettings {
        return {
        } as CanvasRenderingContext2DSettings;
      }
    } as unknown as CanvasRenderingContext2D;
    this.ctx.imageSmoothingEnabled = false;
    this.text = document.createElement('p');
    this.text.innerText = '';
    this.text.style.display = 'none';
    this.div = document.createElement('div');
    this.div.appendChild(this.text);
    this.div.appendChild(this.canvas);
    this.div.appendChild(this.canvas3D);
  }

  getGfx() {
    return this.gfx;
  }

  async requestMouseLock() {
    await this.canvas.requestPointerLock();
  }

  endMouseLock() {
    document.exitPointerLock();
  }

  setupPrograms() {
    this.program = this.gfx.createProgram();

    let vertexShader = this.gfx.createShader(this.gfx.VERTEX_SHADER);
    this.gfx.shaderSource(vertexShader, `
      attribute vec4 aVertexPosition;
      attribute vec4 aVertexColor;
      attribute vec2 aTextureCoord;
      attribute vec3 aVertexNormal;
      attribute vec4 aEnableTexture;
      attribute vec3 aAmbientLight;

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

        highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

        highp float directional = max(dot(transformedNormal.xyz,  normalize(uDiretionalLightVector)), 0.0);
        vLighting = uAmbientLight + (uDiretionalLightColor * directional);
        vColor = aVertexColor;
        vTextureCoord = aTextureCoord;
      }
    `);
    if (vertexShader = this.compileShader(vertexShader, 'vertex')) {
      this.gfx.attachShader(this.program, vertexShader);
    }

    let fragmentShader = this.gfx.createShader(this.gfx.FRAGMENT_SHADER);
    this.gfx.shaderSource(fragmentShader, `
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
        // vec4 texelColor = vColor * (ones - uEnableTexture) + texture2D(uSampler, vTextureCoord) * uEnableTexture; // color OR texture
        vec4 texelColor = vColor + texture2D(uSampler, vTextureCoord) * uEnableTexture; // color OR color + texture
        gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
        if(gl_FragColor.a < 0.1) discard;
      }
    `);
    if (fragmentShader = this.compileShader(fragmentShader, 'fragment')) {
      this.gfx.attachShader(this.program, fragmentShader);
    }

    this.gfx.linkProgram(this.program);

    if (!this.gfx.getProgramParameter(this.program, this.gfx.LINK_STATUS)) {
      console.log("Error linking shader program:");
      console.log(this.gfx.getProgramInfoLog(this.program));
    }
  }

  compileShader(shader: WebGLShader, type: string) {
    this.gfx.compileShader(shader);
    if (!this.gfx.getShaderParameter(shader, this.gfx.COMPILE_STATUS)) {
      console.log(`Error compiling shader: ${type}`);
      console.log(this.gfx.getShaderInfoLog(shader));
    }
    return shader;
  }

  debugInfo(info: any): void {
    this.text.innerText = JSON.stringify(info);
  }

  showDebugInfo() {
    this.text.style.display = 'block';
  }

  hideDebugInfo() {
    this.text.style.display = 'none';
  }

  rectangle() {
    const rect =  this.canvas.getClientRects();
    return new Rectangle(rect[0].x, rect[0].y, rect[0].width, rect[0].height);
  }

  async draw(entities: Array<Entity>): Promise<void> {
    this.canvas3D.style.top = `${this.canvas.getBoundingClientRect().top}px`;
    this.canvas3D.style.left = `${this.canvas.getBoundingClientRect().left}px`;

    this.gfx.viewport(0, 0, this.canvas3D.width, this.canvas3D.height);
    this.gfx.clearColor(this.bgColor3D.r, this.bgColor3D.g, this.bgColor3D.b, this.bgColor3D.a);
    this.gfx.clearDepth(1.0);
    this.gfx.clear(this.gfx.COLOR_BUFFER_BIT | this.gfx.DEPTH_BUFFER_BIT);

    this.gfx.useProgram(this.program);
    this.gfx.enable(this.gfx.DEPTH_TEST);
    //this.gfx.enable(this.gfx.ALPHA_BITS);
    this.gfx.enable(this.gfx.BLEND);
    this.gfx.blendFunc(this.gfx.SRC_ALPHA, this.gfx.ONE_MINUS_SRC_ALPHA);
    this.gfx.depthFunc(this.gfx.LEQUAL);

    this.ctx.clearRect(0, 0, this.canvas.width * this.scale, this.canvas.height * this.scale);
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width * this.scale, this.canvas.height * this.scale);
    this.ctx.scale(this.scale, this.scale);

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      entity.painter.paint(this.gfx, this.program, this.ctx);
    }
    this.ctx.resetTransform();

    return Promise.resolve();
  }

  viewElement(): HTMLElement {
    return this.div;
  }

  hasElement(element: Element | EventTarget): boolean {
    return this.canvas == element || this.canvas3D == element;
  }

  activate(): void {
    if (!this.activated) {
      document.body.appendChild(this.viewElement());
    }
    this.activated = true;
  }

  deactivate(): void {
    if (this.activated) {
      document.body.removeChild(this.viewElement());
    }
    this.activated = false;
  }
}

export class Painter3D implements Painter {
  constructor(private callback: (gfx: WebGL2RenderingContext, program: WebGLProgram, ctx: CanvasRenderingContext2D) => void) {

  }

  paint(gfx: WebGL2RenderingContext, program: WebGLProgram, ctx: CanvasRenderingContext2D): void {
    this.callback(gfx, program, ctx);
  };
}