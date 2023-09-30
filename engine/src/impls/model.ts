import { mat4, vec3 } from "gl-matrix";
import { ModelEntity } from "./model-entity.js";

export function isPowerOf2(value: number) {
  return (value & (value - 1)) === 0;
}
export type TextureData = { url: string, image?: HTMLImageElement, texture: WebGLTexture, isLoaded: boolean };

export class Model {
  private static textures: { [key: string]: TextureData } = {};
  private vertexes: WebGLBuffer;
  private vertexColors: WebGLBuffer;
  private vertexNormals: WebGLBuffer;
  private vertexTextureCoords: WebGLBuffer;
  private triangles: WebGLBuffer;
  
  constructor(gfx: WebGL2RenderingContext, private data: {textureUrl: string | null, vertexes: number[], normals: number[], colors: number[], textureCoords: number[], triangles: number[], center: {x: number, y: number, z: number}}) {
    if (this.data.textureUrl && !Model.textures[this.data.textureUrl]) {
      Model.textures[this.data.textureUrl] = { url: this.data.textureUrl, image: new Image(), texture: gfx.createTexture(), isLoaded: false };
      Model.loadTextureData(gfx, Model.textures[this.data.textureUrl])
    }

    this.vertexes = gfx.createBuffer();

    gfx.bindBuffer(gfx.ARRAY_BUFFER, this.vertexes);
    gfx.bufferData(gfx.ARRAY_BUFFER, new Float32Array(this.data.vertexes), gfx.STATIC_DRAW);

    this.vertexNormals = gfx.createBuffer();
    gfx.bindBuffer(gfx.ARRAY_BUFFER, this.vertexNormals);
    gfx.bufferData(gfx.ARRAY_BUFFER, new Float32Array(this.data.normals), gfx.STATIC_DRAW);

    this.vertexColors = gfx.createBuffer();
    gfx.bindBuffer(gfx.ARRAY_BUFFER, this.vertexColors);
    gfx.bufferData(gfx.ARRAY_BUFFER, new Float32Array(this.data.colors), gfx.STATIC_DRAW);

    this.vertexTextureCoords = gfx.createBuffer();
    gfx.bindBuffer(gfx.ARRAY_BUFFER, this.vertexTextureCoords);
    gfx.bufferData(gfx.ARRAY_BUFFER, new Float32Array(this.data.textureCoords), gfx.STATIC_DRAW);

    this.triangles = gfx.createBuffer();
    gfx.bindBuffer(gfx.ELEMENT_ARRAY_BUFFER, this.triangles);
    gfx.bufferData(gfx.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.data.triangles), gfx.STATIC_DRAW);
  }

  static loadTextureData(gfx: WebGL2RenderingContext, data: TextureData) {
    gfx.bindTexture(gfx.TEXTURE_2D, data.texture);
    gfx.texImage2D(
      gfx.TEXTURE_2D,
      0,
      gfx.RGBA,
      1,
      1,
      0,
      gfx.RGBA,
      gfx.UNSIGNED_BYTE,
      new Uint8Array([255, 0, 255, 100])
    );

    data.image.onload = () => {
      let func = (funcData: TextureData) => {
        gfx.bindTexture(gfx.TEXTURE_2D, funcData.texture);
        gfx.pixelStorei(gfx.UNPACK_FLIP_Y_WEBGL, true);
        gfx.texImage2D(
          gfx.TEXTURE_2D,
          0,
          gfx.RGBA,
          funcData.image.width,
          funcData.image.height,
          0,
          gfx.RGBA,
          gfx.UNSIGNED_BYTE,
          funcData.image
        );

        if (isPowerOf2(funcData.image.width) && isPowerOf2(funcData.image.height)) {
          gfx.generateMipmap(gfx.TEXTURE_2D);
        } else {
          gfx.texParameteri(gfx.TEXTURE_2D, gfx.TEXTURE_WRAP_S, gfx.CLAMP_TO_EDGE);
          gfx.texParameteri(gfx.TEXTURE_2D, gfx.TEXTURE_WRAP_T, gfx.CLAMP_TO_EDGE);
          gfx.texParameterf(gfx.TEXTURE_2D, gfx.TEXTURE_MIN_FILTER, gfx.LINEAR);
          gfx.texParameterf(gfx.TEXTURE_2D, gfx.TEXTURE_MAG_FILTER, gfx.NEAREST);
        }

      };
      func(data);
      data.isLoaded = true;
    };

    data.image.src = data.url;
  }

  draw(gfx: WebGL2RenderingContext, program: WebGLProgram, ctx: CanvasRenderingContext2D, ctxUI: CanvasRenderingContext2D, entity: ModelEntity) {
    gfx.useProgram(program);

    const model = mat4.create();

    const entityPos = entity.getPos3D();
    const entityRot = entity.getRot3D();

    // move to position in world
    const uModelViewMatrix = gfx.getUniformLocation(program, "uModelViewMatrix");
    mat4.translate(
      model,
      model,
      [
        entityPos.x,
        entityPos.y,
        entityPos.z,
      ]
    );

    mat4.translate(
      model,
      model,
      [
        this.data.center.x,
        this.data.center.y,
        this.data.center.z
      ]
    );

    mat4.scale(
      model,
      model,
      [
        entity.getScale(),
        entity.getScale(),
        entity.getScale()
      ]
    );

    mat4.rotate(
      model,
      model,
      entityRot.pitch,
      [
        1, 0, 0
      ]
    );

    mat4.rotate(
      model,
      model,
      entityRot.yaw,
      [
        0, 1, 0
      ]
    );

    mat4.rotate(
      model,
      model,
      entityRot.roll,
      [
        0, 0, 1
      ]
    );

    mat4.translate(
      model,
      model,
      [
        -this.data.center.x,
        -this.data.center.y,
        -this.data.center.z
      ]
    );

    gfx.uniformMatrix4fv(
      uModelViewMatrix,
      false,
      model
    );

    // calc normals
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, model);

    mat4.transpose(normalMatrix, normalMatrix);
    const uNormalMatrix = gfx.getUniformLocation(program, "uNormalMatrix");
    gfx.uniformMatrix4fv(
      uNormalMatrix,
      false,
      normalMatrix
    );

    // vertex positions
    const aVertexPosition = gfx.getAttribLocation(program, "aVertexPosition");
    gfx.bindBuffer(gfx.ARRAY_BUFFER, this.vertexes);
    gfx.vertexAttribPointer(
      aVertexPosition,
      3, // x,y,z
      gfx.FLOAT,
      false,
      0,
      0
    );
    gfx.enableVertexAttribArray(aVertexPosition);

    // vertex normals
    const aVertexNormal = gfx.getAttribLocation(program, "aVertexNormal");
    gfx.bindBuffer(gfx.ARRAY_BUFFER, this.vertexNormals);
    gfx.vertexAttribPointer(
      aVertexNormal,
      3, // x,y,z
      gfx.FLOAT,
      false,
      0,
      0
    );
    gfx.enableVertexAttribArray(aVertexNormal);

    // vertex colors
    const aVertexColor = gfx.getAttribLocation(program, "aVertexColor");
    gfx.bindBuffer(gfx.ARRAY_BUFFER, this.vertexColors);
    gfx.vertexAttribPointer(
      aVertexColor,
      4, // r,g,b,a
      gfx.FLOAT,
      false,
      0,
      0
    );
    gfx.enableVertexAttribArray(aVertexColor);

    // vertex texture coordinates
    const aTextureCoord = gfx.getAttribLocation(program, "aTextureCoord");
    gfx.bindBuffer(gfx.ARRAY_BUFFER, this.vertexTextureCoords);
    gfx.vertexAttribPointer(
      aTextureCoord,
      2, //x, 1-y
      gfx.FLOAT,
      false,
      0,
      0
    );
    gfx.enableVertexAttribArray(aTextureCoord);

    // set texture data
    const uTextureSampler = gfx.getUniformLocation(program, "uSampler");
    const uEnableTexture = gfx.getUniformLocation(program, "uEnableTexture");
    gfx.uniform4fv(uEnableTexture, [0, 0, 0, 0]);
    if (Model.textures[this.data.textureUrl].isLoaded) {
      gfx.activeTexture(gfx.TEXTURE0);
      gfx.bindTexture(gfx.TEXTURE_2D, Model.textures[this.data.textureUrl].texture);
      gfx.uniform1i(uTextureSampler, 0);
      gfx.uniform4fv(uEnableTexture, [1, 1, 1, 1]);
    }

    gfx.bindBuffer(gfx.ELEMENT_ARRAY_BUFFER, this.triangles);
    
    // draw
    gfx.drawElements(gfx.TRIANGLES, this.data.triangles.length, gfx.UNSIGNED_SHORT, 0);
  }
}