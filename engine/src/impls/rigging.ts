import { mat4 } from "gl-matrix";
import { ModelEntity } from "./model-entity.js";
import { Model, Transforms } from "./model.js";

export type RigData = { model: Model, id: number, subModels: RigData[], transforms: Transforms };

export type AnimationData = { frames: number, [key: number]: Transforms[] };

export const NoAnimation: Transforms = {
  position: {
    x: 0,
    y: 0,
    z: 0
  },
  rotation: {
    yaw: 0,
    pitch: 0,
    roll: 0
  },
  scale: {
    x: 1,
    y: 1,
    z: 1
  },
};

export class Rigging {
  
  private animationData: AnimationData;
  private animationFrame: number = 0;
  constructor(private rigData: RigData) {   
  }

  setAnimationData(animation: AnimationData) {
    this.animationData = animation;
  }

  deltaAnimationFrame(val: number) {
    this.animationFrame += val;
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
        this.rigData.model.center().x,
        this.rigData.model.center().y,
        this.rigData.model.center().z
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
        -this.rigData.model.center().x,
        -this.rigData.model.center().y,
        -this.rigData.model.center().z
      ]
    );

    const scale = entity.getScale();

    mat4.scale(
      model,
      model,
      [
        scale.x,
        scale.y,
        scale.z,
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

    this.drawRig(gfx, program, ctx, ctxUI, model, this.rigData);
  }

  private drawRig(gfx: WebGL2RenderingContext, program: WebGLProgram, ctx: CanvasRenderingContext2D, ctxUI: CanvasRenderingContext2D, model: mat4, rig: RigData) {
    let cloneModel =  mat4.clone(model);
    let animationTransform: Transforms = NoAnimation;
    if (this.animationData && this.animationData[rig.id]) {
      // Perform animation interpolation
      const frame = Math.floor(this.animationFrame) % this.animationData.frames;
      const nextFrame = (frame + 1) % (this.animationData.frames + 1);
      const time = this.animationFrame - Math.floor(this.animationFrame);
      const transformA = this.animationData[rig.id][frame];
      const transformB = this.animationData[rig.id][nextFrame];
      animationTransform = {
        position: {
          x: transformA.position.x * (1 - time) + transformB.position.x * time,
          y: transformA.position.y * (1 - time) + transformB.position.y * time,
          z: transformA.position.z * (1 - time) + transformB.position.z * time,
        },
        rotation: {
          yaw: transformA.rotation.yaw * (1 - time) + transformB.rotation.yaw * time,
          pitch: transformA.rotation.pitch * (1 - time) + transformB.rotation.pitch * time,
          roll: transformA.rotation.roll * (1 - time) + transformB.rotation.roll * time,
        },
        scale: {
          x: transformA.scale.x * (1 - time) + transformB.scale.x * time,
          y: transformA.scale.y * (1 - time) + transformB.scale.y * time,
          z: transformA.scale.z * (1 - time) + transformB.scale.z * time,
        },
      };
    }

    rig.model.drawWithTransforms(gfx, program, ctx, ctxUI, cloneModel, rig.transforms, animationTransform);
    rig.subModels.forEach(rigChild => {
      this.drawRig(gfx, program,ctx, ctxUI, cloneModel, rigChild);
    })
  }
}