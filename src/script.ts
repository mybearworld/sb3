/**
 * A script comprised of Scratch blocks.
 *
 * This class is responsible for turning blocks into the project.json format.
 */
export class Script {
  private _blocks: Record<string, IndividualBlock> = {};
  private _first: string | null = null;
  private _last: string | null = null;
  private _shadow: boolean;
  private _topLevel: boolean;

  /**
   * Create a script.
   * @param shadow Whether the script should be a shadow script.
   */
  constructor({ shadow = false, topLevel = false }: ScriptOptions = {}) {
    this._shadow = shadow;
    this._topLevel = topLevel;
  }

  /**
   * Add a new {@link Block} to the script.
   * @param block The block to add.
   * @returns The current instance, for chaining.
   *
   * @example
   * new Script().push(block("block1")).push(block("block2"))
   */
  push(block: Block): Script {
    this._blocks = {
      ...this._blocks,
      ...Object.fromEntries(
        Object.entries(block.blocks).map(([opcode, individualBlock]) => {
          return [
            opcode,
            {
              ...individualBlock,
              ...(this._shadow ? { shadow: true } : {}),
              ...(opcode === block.base ? { parent: this._last } : {}),
            },
          ];
        })
      ),
    };
    if (this._last) {
      this._blocks[this._last].next = block.base;
    }
    if (!this.first) {
      this._first = block.base;
      this._blocks[block.base].topLevel = this._topLevel;
    }
    this._last = block.base;
    return this;
  }

  /**
   * The current list of blocks, in project.json format.
   */
  public get blocks(): Record<string, IndividualBlock> {
    return this._blocks;
  }

  /**
   * The opcode of the first block.
   */
  public get first(): string | null {
    return this._first;
  }

  /**
   * The opcode of the last block.
   */
  public get last(): string | null {
    return this._last;
  }
}

/** Options passed to the {@link Script} constructor. */
export type ScriptOptions = {
  /**
   * Whether all scripts should have the shadow property set on them.
   *
   * Defaults to false.
   */
  shadow?: boolean;
  /**
   * Whether the script is at the top level.
   *
   * Defaults to false.
   */
  topLevel?: boolean;
};

/**
 * Creates a {@link Block} which may depend on other blocks. This needs to be
 * passed into a {@link Script} for Scratch usage.
 * @param opcode The opcode of the block.
 * @param options The inputs and fields of the block.
 * @returns The new block.
 */
export const block = (
  opcode: string,
  { inputs = {}, fields = {} }: BlockOptions = {}
): Block => {
  const baseOpcode = crypto.randomUUID();
  const block: Block = {
    blocks: {
      [baseOpcode]: {
        opcode,
        inputs: {},
        fields: Object.fromEntries(
          Object.entries(fields).map(([name, field]) => {
            return [name, [field, null]];
          })
        ),
        parent: null,
        next: null,
        x: 0,
        y: 0,
        shadow: false,
        topLevel: false,
      },
    },
    base: baseOpcode,
  };
  Object.entries(inputs).forEach(([name, input]) => {
    if (typeof input.value === "string") {
      block.blocks[baseOpcode].inputs[name] = [1, [input.type, input.value]];
      return;
    }
    if (!input.value.first) {
      return;
    }
    block.blocks = {
      ...block.blocks,
      ...input.value.blocks,
    };
    block.blocks[baseOpcode].inputs[name] = [2, input.value.first];
    return;
  });
  return block;
};

/** The options passed to the {@link block} function. */
export type BlockOptions = {
  /**
   * The inputs that the block has. Defaults to none.
   */
  inputs?: Record<string, { type: number; value: string | Script }>;
  /**
   * The fields that the block has. Defaults to none.
   */
  fields?: Record<string, string>;
};

/**
 * A collection of individual blocks, that all represent one block. In most
 * cases, these should be created with the {@link block} function.
 */
export type Block = {
  blocks: Record<string, IndividualBlock>;
  base: string;
};

/**
 * An individual block.
 *
 * This is also the representation of a block in the project.json format.
 */
export type IndividualBlock = {
  opcode: string;
  inputs: Record<string, [1, [number, string]] | [2, string] /* | [3, ...] */>;
  fields: Record<string, [string, null]>;
  parent: string | null;
  next: string | null;
  x: number;
  y: number;
  shadow: boolean;
  topLevel: boolean;
};
