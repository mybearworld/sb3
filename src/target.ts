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
   * Does nothing on a stage. Defaults to 0.
   */
  public size = 0;
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
   * Converts the target into the sprite.json format Scratch can understand.
   *
   * While this method will work for stages, the resulting output has to be
   * modified and added to a {@link Project} in order for it to be useful. This
   * is automatically handled by Project.
   *
   * @example
   * const target = new Target("Scratch Cat");
   * target.toJSON(); // { isStage: false, x: 0, y: 0, ... }
   * JSON.stringify(target); // '{"isStage":false,"x":0,...}'
   */
  toJSON(): JSONTarget {
    return {
      isStage: this.isStage,
      x: this.x,
      y: this.y,
      name: this._name ?? "Stage",
      size: this.size,
      direction: this.direction,
      draggable: this.draggable,
      rotationStyle: this.rotationStyle,
      layerOrder: this.layerOrder,
      visible: this.visible,
      variables: {},
      lists: {},
      broadcasts: {},
      blocks: {},
      comments: {},
      costumes: [],
      sounds: [],
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
  blocks: unknown;
  comments: unknown;
  costumes: unknown;
  sounds: unknown;
};
