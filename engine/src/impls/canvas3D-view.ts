import { mat4, vec3 } from "gl-matrix";
import { Entity } from "../entity.js";
import { Painter } from "../painter.js";
import { Rectangle } from "../utils/rectangle.js";
import { View } from "../view.js";
import { ModelEntity } from "./model-entity.js";
import { SpriteEntity } from "./sprite-entity.js";
import { Sprite } from "./sprite.js";
import { SpritePainter } from "./sprite-painter.js";

export type Camera = {
  yaw: number,
  pitch: number,
  vec3: () => vec3
};

export type Canvas3DViewOptions = {
  scale?: number,
  preScale3D?: boolean,
  bgColor: string,
  vertexShaderCode?: string,
  fragmentShaderCode?: string,
  camera?: Camera,
}

export class Canvas3DView implements View {
  private activated: boolean = false;
  private canvas: HTMLCanvasElement;
  private canvasUI: HTMLCanvasElement;
  private canvas3D: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ctxUI: CanvasRenderingContext2D;
  private gfx: WebGL2RenderingContext;
  private text: HTMLParagraphElement;
  private div: HTMLDivElement;
  public readonly scale: number;
  public readonly dpi: number;
  private bgColor: string;
  private bgColor3D: { r: number, g: number, b: number, a: number };
  private vertexShaderCode: string;
  private fragmentShaderCode: string;
  private camera: Camera;
  program: WebGLProgram;

  constructor(width: number, height: number, options: Canvas3DViewOptions) {
    this.scale = options.scale ?? 1;
    let preScale3D = options.preScale3D ?? false;
    this.dpi = 96 * window.window.devicePixelRatio;
    this.bgColor = options.bgColor ?? '#00FFFFFF';
    this.bgColor3D = {
      r: Number.parseInt(this.bgColor.slice(1,3), 16) / 255,
      g: Number.parseInt(this.bgColor.slice(3,5), 16) / 255,
      b: Number.parseInt(this.bgColor.slice(5,7), 16) / 255,
      a: Number.parseInt(this.bgColor.slice(7,9), 16) / 255,
    }
    this.vertexShaderCode = options.vertexShaderCode;
    this.fragmentShaderCode = options.fragmentShaderCode;
    this.camera = {
      yaw: 0,
      pitch: 0,
      vec3: () => vec3.fromValues(0, 0, 0),
      ...options.camera
    }

    this.canvas3D = document.createElement('canvas');
    this.canvas3D.style.display = 'block';
    if (preScale3D) {
      this.canvas3D.width = width * this.scale;
      this.canvas3D.height = height * this.scale;
      this.canvas3D.style.width = `${this.canvas3D.width * 96 / this.dpi}px`;
    } else {
      this.canvas3D.width = width;
      this.canvas3D.height = height;
      this.canvas3D.style.width = `${this.canvas3D.width * this.scale * 96 / this.dpi}px`;
    }
    this.canvas3D.style.zIndex = '0';
    this.canvas3D.style.position = 'absolute';
    this.canvas3D.style.imageRendering = 'pixelated';
    this.gfx = this.canvas3D.getContext('webgl2');

    this.setupPrograms();

    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.width = width * this.scale;
    this.canvas.height = height * this.scale;
    this.canvas.style.width = `${this.canvas.width * 96 / this.dpi}px`;
    this.canvas.style.zIndex = '-1';
    this.ctx = this.canvas.getContext('2d') || {
      canvas: HTMLCanvasElement,
      getContextAttributes(): CanvasRenderingContext2DSettings {
        return {
        } as CanvasRenderingContext2DSettings;
      }
    } as unknown as CanvasRenderingContext2D;
    this.ctx.imageSmoothingEnabled = false;

    this.canvasUI = document.createElement('canvas');
    this.canvasUI.style.display = 'block';
    this.canvasUI.width = width * this.scale;
    this.canvasUI.height = height * this.scale;
    this.canvasUI.style.width = `${this.canvasUI.width * 96 / this.dpi}px`;
    this.canvasUI.style.zIndex = '1';
    this.canvasUI.style.position = 'absolute';
    this.ctxUI = this.canvasUI.getContext('2d') || {
      canvas: HTMLCanvasElement,
      getContextAttributes(): CanvasRenderingContext2DSettings {
        return {
        } as CanvasRenderingContext2DSettings;
      }
    } as unknown as CanvasRenderingContext2D;
    this.ctxUI.imageSmoothingEnabled = false;

    this.text = document.createElement('p');
    this.text.innerText = '';
    this.text.style.display = 'none';
    this.div = document.createElement('div');
    this.div.appendChild(this.text);
    this.div.appendChild(this.canvas);
    this.div.appendChild(this.canvasUI);
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
    this.gfx.shaderSource(vertexShader, this.vertexShaderCode || `
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
    this.gfx.shaderSource(fragmentShader, this.fragmentShaderCode || `
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

  draw(entities: Array<Entity>): void {
    this.canvas3D.style.top = `${this.canvas.getBoundingClientRect().top}px`;
    this.canvas3D.style.left = `${this.canvas.getBoundingClientRect().left}px`;
    this.canvasUI.style.top = `${this.canvas.getBoundingClientRect().top}px`;
    this.canvasUI.style.left = `${this.canvas.getBoundingClientRect().left}px`;

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

    this.ctxUI.clearRect(0, 0, this.canvas.width * this.scale, this.canvas.height * this.scale);
    this.ctxUI.scale(this.scale, this.scale);

    // camera
    const uProjectionMatrix = this.gfx.getUniformLocation(this.program, "uProjectionMatrix");
    let fov = (45 * Math.PI) / 180;
    let aspect = 240 / 160;
    let near = 0.1;
    let far = 100;
    const perspective = mat4.perspective(mat4.create(), fov, aspect, near, far);
    mat4.rotate(perspective, perspective, this.camera.yaw, [0, 1, 0]);
    mat4.rotate(perspective, perspective, this.camera.pitch, [Math.cos(this.camera.yaw), 0, Math.sin(this.camera.yaw)]);
    mat4.translate(perspective, perspective, this.camera.vec3());
    this.gfx.uniformMatrix4fv(
      uProjectionMatrix,
      false,
      perspective
    );

    // lighting
    const uAmbientLight = this.gfx.getUniformLocation(this.program, "uAmbientLight");
    const uDiretionalLightVector = this.gfx.getUniformLocation(this.program, "uDiretionalLightVector");
    const uDiretionalLightColor = this.gfx.getUniformLocation(this.program, "uDiretionalLightColor");
    const ambientIntensity = 0.65;
    const lightIntensity = 0.5;
    this.gfx.uniform3fv(uAmbientLight, [ambientIntensity, ambientIntensity, ambientIntensity]);
    this.gfx.uniform3fv(uDiretionalLightColor, [lightIntensity, lightIntensity, lightIntensity]);
    this.gfx.uniform3fv(uDiretionalLightVector, [0, 0, 1]);

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (entity instanceof ModelEntity) {
        entity.painter.paint(this.gfx, this.program, this.ctx, this.ctxUI);
      } else if (entity.painter instanceof UIPainter) {
        entity.painter.paint(this.ctxUI);
      } else if (entity instanceof SpriteEntity) {
        entity.painter.paint(this.ctx);
      }
    }
    this.ctx.resetTransform();
    this.ctxUI.resetTransform();
  }

  viewElement(): HTMLElement {
    return this.div;
  }

  hasElement(element: Element | EventTarget): boolean {
    return this.canvas == element || this.canvasUI == element || this.canvas3D == element;
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
  constructor(private callback: (gfx: WebGL2RenderingContext, program: WebGLProgram, ctx: CanvasRenderingContext2D, ctxUI: CanvasRenderingContext2D) => void) {

  }

  paint(gfx: WebGL2RenderingContext, program: WebGLProgram, ctx: CanvasRenderingContext2D, ctxUI: CanvasRenderingContext2D): void {
    this.callback(gfx, program, ctx, ctxUI);
  };
}

export class UIPainter extends SpritePainter {
}