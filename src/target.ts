import type { Script, IndividualBlock } from "./script.ts";
import { idFor } from "./costumeIds.ts";

/**
 * A Scratch target, being either a sprite or the stage.
 *
 * On their own, stages are not useful as they cannot be used with Scratch. They
 * have to be passed into a {@link Project} to become usable.
 */
export class Target {
  /** The name of the sprite, or `undefined` if it's the stage. */
  private _name?: string;
  /**
   * The initial volume of the target.
   *
   * Defaults to 100.
   */
  public volume = 100;
  /**
   * The initial costume number of the target.
   *
   * The costume number is zero-indexed. Defaults to 0.
   */
  public currentCostume = 0;
  /**
   * The initial x position of the sprite.
   *
   * Does nothing on a stage. Defaults to 0.
   */
  public x = 0;
  /**
   * The initial y position of the sprite.
   *
   * Does nothing on a stage. Defaults to 0.
   */
  public y = 0;
  /** The initial size of the sprite.
   *
   * Does nothing on a stage. Defaults to 100.
   */
  public size = 100;
  /**
   * The initial direction of the sprite.
   *
   * Does nothing on a stage. Defaults to 90.
   */
  public direction = 90;
  /**
   * Whether the sprite is initially draggable.
   *
   * Does nothing on a stage. Defaults to false.
   */
  public draggable = false;
  /**
   * The initial rotation style of the sprite.
   *
   * Does nothing on a stage. Defaults to `"all around"`.
   */
  public rotationStyle: RotationStyle = "all around";
  /**
   * The initial layer the sprite is on.
   *
   * This is not very useful on its own, but becomes useful when used in
   * combination with other sprites in a {@link Project}. Does nothing on a
   * stage. Defaults to 1.
   */
  public layerOrder = 1;
  /**
   * Whether the sprite is initially visible.
   *
   * Does nothing on a stage. Defaults to true.
   */
  public visible = true;
  /**
   * The costumes of the sprite.
   *
   * One is necessary to convert the target to JSON. Defaults to [].
   */
  public costumes: Costume[] = [];
  /**
   * The sounds of the sprite.
   *
   * Defaults to [].
   */
  public sounds: Sound[] = [];
  private _scripts: Record<string, IndividualBlock> = {};

  /**
   * Create a new target.
   * @param name The name of the sprite. If this is left out, the target gets
   * treated as a stage.
   */
  constructor(name?: string) {
    this._name = name;
  }

  /**
   * The name of the target.
   *
   * If called on a stage, this is `undefined`.
   */
  get name(): string | undefined {
    return this._name;
  }

  /** Whether the target is a stage. */
  get isStage(): boolean {
    return this._name === undefined;
  }

  /**
   * Sets the name of the sprite.
   * @param name The new name of the sprite.
   * @throws If this is called on the stage. Use {@link Target.isStage} before
   * to check.
   */
  setName(name: string) {
    if (!this._name) {
      throw new Error(
        "Called Target.setName on a stage, which is not possible."
      );
    }
    this._name = name;
  }

  /**
   * Adds a new {@link Script} to the target.
   * @param script The script to add.
   */
  addScript(script: Script) {
    this._scripts = {
      ...this._scripts,
      ...script.blocks,
    };
  }

  /**
   * Converts the target into the sprite.json format Scratch can understand.
   *
   * While this method will work for stages, the resulting output has to be
   * modified and added to a {@link Project} in order for it to be useful. This
   * is automatically handled by Project.
   *
   * @throws If there isn't at least one costume.
   *
   * @example
   * const target = new Target("Scratch Cat");
   * target.toJSON(); // { isStage: false, x: 0, y: 0, ... }
   * JSON.stringify(target); // '{"isStage":false,"x":0,...}'
   */
  toJSON(): JSONTarget {
    if (this.costumes.length === 0) {
      throw new Error("Target.toJSON called with a target without costumes");
    }
    return {
      isStage: this.isStage,
      x: this.x,
      y: this.y,
      name: this._name ?? "Stage",
      size: this.size,
      direction: this.direction,
      draggable: this.draggable,
      rotationStyle: this.rotationStyle,
      layerOrder: this.isStage ? 0 : this.layerOrder,
      visible: this.visible,
      variables: {},
      lists: {},
      broadcasts: {},
      blocks: this._scripts,
      comments: {},
      costumes: this.costumes.map((costume) => {
        const id = idFor(costume.file);
        return {
          name: costume.name,
          bitmapResolution: costume.type === "svg" ? 1 : 2,
          dataFormat: costume.type,
          assetId: id,
          md5ext: `${id}.${costume.type}`,
          rotationCenterX: costume.rotationCenter?.[0] ?? 0,
          rotationCenterY: costume.rotationCenter?.[1] ?? 0,
        };
      }),
      sounds: this.sounds.map((sound) => {
        const id = idFor(sound.file);
        return {
          name: sound.name,
          dataFormat: sound.type,
          assetId: id,
          md5ext: `${id}.${sound.type}`,
          format: "",
          rate: 0,
          sampleCount: 0,
        };
      }),
    };
  }
}

/**
 * Possible rotation styles a sprite can have.
 */
export type RotationStyle = "all around" | "left-right" | "don't rotate";

/**
 * The sprite.json representation of a target.
 */
export type JSONTarget = {
  isStage: boolean;
  x: number;
  y: number;
  name: string;
  size: number;
  direction: number;
  draggable: boolean;
  rotationStyle: RotationStyle;
  layerOrder: number;
  visible: boolean;
  variables: unknown;
  lists: unknown;
  broadcasts: unknown;
  blocks: Record<string, IndividualBlock>;
  comments: unknown;
  costumes: {
    name: string;
    bitmapResolution: 1 | 2;
    dataFormat: "svg" | "png";
    assetId: string;
    md5ext: string;
    rotationCenterX: number;
    rotationCenterY: number;
  }[];
  sounds: {
    name: string;
    assetId: string;
    dataFormat: "wav" | "mp3";
    format: string;
    rate: number;
    sampleCount: number;
    md5ext: string;
  }[];
};

/**
 * A costume added to a {@link Sprite}.
 */
export type Costume = {
  /** The name of the costume. */
  name: string;
  /** The file type of the costume. */
  type: "svg" | "png";
  /** The read file of the costume. */
  file: ReadableStream<Uint8Array>;
  /** The rotation center of the costume. Defaults to [0, 0] */
  rotationCenter?: [number, number];
};

/**
 * A sound added to a {@link Sprite}.
 */
export type Sound = {
  /** The name of the sound. */
  name: string;
  /** The file type of the sound. */
  type: "wav" | "mp3";
  /** The read file of the sound. */
  file: ReadableStream<Uint8Array>;
};
