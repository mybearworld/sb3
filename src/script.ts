import { generateID } from "./ids.ts";

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
 *
 * @param opcode The opcode of the block.
 * @param options The inputs and fields of the block.
 * @returns The new block.
 *
 * @example
 * Basic block
 *
 * ```
 * block("event_whenflagclicked")
 * ```
 *
 * This represents a block with the opcode "event_whenflagclicked", and no
 * inputs or fields.
 *
 * ```json
 * {
 *   "opcode": "event_whenflagclicked",
 *   "inputs": {},
 *   "fields": {},
 *   ...
 * }
 * ```
 *
 * @example
 * Block with inputs
 *
 * ```
 * block("motion_movesteps", {
 *   inputs: { STEPS: { type: 4, value: "10" } },
 * })
 * ```
 *
 * This represents a block with the opcode "motion_movesteps", no fields, and
 * one input named STEPS with the type 4 (i.e. a number), and the value "10".
 *
 * ```json
 * {
 *   "opcode": "motion_movesteps",
 *   "inputs": { "STEPS": [1, [4, "10"]] },
 *   "fields": {},
 *   ...
 * }
 * ```
 *
 * @example
 * Block with fields
 *
 * ```
 * block("looks_seteffectto", {
 *   inputs: { VALUE: { type: 4, value: "25" } },
 *   fields: { EFFECT: "COLOR" },
 * })
 * ```
 *
 * This represents a block with the opcode "looks_seteffectto", an input with
 * the type 4 (i.e. a number), ant the value 25, and a field named EFFECT with
 * the value of COLOR.
 *
 * ```json
 * {
 *   "opcode": "looks_seteffectto",
 *   "inputs": { "VALUE": [1, [4, "25"]] },
 *   "fields": { "EFFECT": ["COLOR", null] },
 *   ...
 * }
 * ```
 *
 * @example
 * Block with a menu
 *
 * ```
 * block("sound_playuntildone", {
 *   inputs: {
 *     SOUND_MENU: {
 *       value: new Script({ shadow: true }).push(
 *         block("sound_sounds_menu", {
 *           fields: { SOUND_MENU: "Meow" },
 *         })
 *       ),
 *     },
 *   },
 * })
 * ```
 *
 * This represents a block with the opcode "sound_playuntildone", that contains
 * a script as an input. This script has the shadow property set to true, so
 * you cannot pull it out of the outer block. It contains another block with
 * the opcode sound_sounds_menu, with no inputs and a SOUND_MENU field set to
 * "Meow".
 *
 * ```json
 * "bdc71501-2d6c-49d2-b71d-093aa24a7ea3": {
 *   "opcode": "sound_playuntildone",
 *   "inputs": {
 *     "SOUND_MENU": [2, "b08a37c9-34f9-461f-86fc-3b7606ba48f1"]
 *   },
 *   "fields": {},
 *   "shadow": false,
 *   ...
 * },
 * "b08a37c9-34f9-461f-86fc-3b7606ba48f1": {
 *   "opcode": "sound_sounds_menu",
 *   "inputs": {},
 *   "fields": { "SOUND_MENU": ["Meow", null] },
 *   "shadow": true,
 *   ...
 * }
 * ```
 *
 * @example
 * Block with another block put in an input
 *
 * ```
 * block("motion_movesteps", {
 *   inputs: {
 *     STEPS: {
 *       fallback: { type: 4, value: "10" },
 *       value: new Script().push(
 *         block("operator_add", {
 *           inputs: {
 *             NUM1: { type: 4, value: "2" },
 *             NUM2: { type: 4, value: "3" },
 *           },
 *         })
 *       ),
 *     },
 *   },
 * })
 * ```
 *
 * This represents a block with an opcode "motion_movesteps", with no field and
 * an input called STEPS. This input has a value of a new script which has
 * another block with the opcode "operator_add" inside of it. The STEPS input
 * has a defined fallback, so if the script in the input is pulled out, there
 * is a fallback value Scratch can show.
 *
 * @example
 * Block with a substack
 *
 * ```
 * block("control_repeat", {
 *   inputs: {
 *     TIMES: { type: 6, value: "10" },
 *     SUBSTACK: {
 *       value: new Script().push(block("looks_show")),
 *     },
 *   },
 * })
 * ```
 *
 * This represents a block with the opcode "control_repeat", that contains
 * a script as an input. This script has the shadow property set to false, as it
 * is not intrinsic to the block. It contains another block with
 * the opcode looks_show, with no inputs or fields.
 *
 * ```json
 * "6e68f89a-67a3-4843-82ab-41989918d998": {
 *   "opcode": "control_repeat",
 *   "inputs": {
 *     "TIMES": [1, [6, "10"]],
 *     "SUBSTACK": [2, "86f78cfc-ea30-401e-80d8-83c8065ac9d3"]
 *   },
 *   "fields": {},
 *   "shadow": false,
 *   ...
 * },
 * "86f78cfc-ea30-401e-80d8-83c8065ac9d3": {
 *   "opcode": "looks_show",
 *   "inputs": {},
 *   "fields": {},
 *   "shadow": false,
 *   ...
 * },
 * ```
 */
export function block(opcode: string, options?: BlockOptions): Block {
  const inputs = options?.inputs ?? {};
  const fields = options?.fields ?? {};
  const baseOpcode = generateID();
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
      if (!("type" in input)) {
        // needed for typescript
        throw new Error(
          "A string has been passed as a value, without any type."
        );
      }
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
    block.blocks[baseOpcode].inputs[name] =
      "fallback" in input && input.fallback
        ? [3, input.value.first, [input.fallback.type, input.fallback.value]]
        : [2, input.value.first];
    return;
  });
  return block;
}

/** The options passed to the {@link block} function. */
export type BlockOptions = {
  /**
   * The inputs that the block has. Defaults to none.
   */
  inputs?: Record<
    string,
    | { type: number; value: string }
    | { value: Script; fallback?: { type: number; value: string } }
  >;
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
  inputs: Record<
    string,
    [1, [number, string]] | [2, string] | [3, string, [number, string]]
  >;
  fields: Record<string, [string, null]>;
  parent: string | null;
  next: string | null;
  x: number;
  y: number;
  shadow: boolean;
  topLevel: boolean;
};
