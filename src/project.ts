import type { JSONTarget, Target } from "./target.ts";
import { BlobWriter, ZipWriter, terminateWorkers } from "@zip-js/zip-js";
import { idFor } from "./ids.ts";

/**
 * A Scratch project.
 *
 * This is a collection of sprites, plus some other properties Scratch puts
 * in the project.json file.
 */
export class Project {
  private targets: Target[] = [];
  private stage: Target | null = null;
  /**
   * The user agent the project was last edited on.
   *
   * There is no user agent that a project made with this library was created
   * on, as it was not created with a browser. Therefore, this property defaults
   * to "Created with https://jsr.io/@mbw/sb3". This property might be used by
   * external services like scratchstats.com to get the project author's
   * browser.
   */
  public userAgent = "Created with https://jsr.io/@mbw/sb3";
  /**
   * The extensions the project depends on.
   */
  public extensions: string[] = [];
  /**
   * A mapping of third-party extensions to their URLs.
   *
   * This is a feature specific to TurboWarp and its mods. Projects which rely
   * on this feature can not be uploaded to the Scratch website.
   */
  public extensionURLs: Record<string, string> = {};

  /**
   * Add a new target to the project.
   *
   * If this is a stage and a stage has already been added, the stage will be
   * replaced.
   *
   * @param target The new target to add.
   */
  addTarget(target: Target) {
    if (target.isStage) {
      this.stage = target;
      return;
    }
    this.targets.push(target);
  }

  /**
   * Converts the project into the project.json format Scratch can understand.
   *
   * @throws If there is no added stage.
   *
   * @example
   * const project = new Project();
   * const stage = new Target();
   * project.addTarget(stage);
   * project.toJSON(); // { targets: { isStage: true ...
   * JSON.stringify(project); // '{"targets":{"isStage":...'
   */
  toJSON(): JSONProject {
    if (!this.stage) {
      throw new Error("Project.toJSON called without added stage");
    }
    return {
      targets: [
        this.stage.toJSON(),
        ...this.targets.map((target) => target.toJSON()),
      ],
      monitors: [],
      extensions: this.extensions,
      extensionURLs: this.extensionURLs,
      meta: {
        semver: "3.0.0",
        vm: "2.3.0",
        agent: this.userAgent,
      },
    };
  }

  /**
   * Returns the file names and contents of the assets of every target.
   *
   * @throws If there is no added stage.
   *
   * @returns A mapping of file names to their assets.
   */
  getAssets(): Record<string, ReadableStream<Uint8Array>> {
    if (!this.stage) {
      throw new Error("Project.getAssets called without added stage");
    }
    return Object.fromEntries(
      [this.stage, ...this.targets].flatMap((target) =>
        [...target.costumes, ...target.sounds].map((costume) => [
          `${idFor(costume.file)}.${costume.type}`,
          costume.file,
        ])
      )
    );
  }

  /**
   * Returns the file names and contents necessary to produce the sb3 file of
   * this project.
   *
   * @throws If there is no added stage.
   *
   * @returns A mapping of file names to their file contents.
   */
  getFiles(): Record<string, ReadableStream<Uint8Array>> {
    if (!this.stage) {
      throw new Error("Project.getFiles called without added stage");
    }
    const textEncoder = new TextEncoder();
    return {
      ...this.getAssets(),
      "project.json": new ReadableStream({
        start: (controller) => {
          controller.enqueue(textEncoder.encode(JSON.stringify(this)));
          controller.close();
        },
      }),
    };
  }

  /**
   * Creates an sb3 file from the project.
   * @returns The resulting zip file as a stream.
   */
  async zip(): Promise<ReadableStream<Uint8Array>> {
    const blobWriter = new BlobWriter();
    const zipWriter = new ZipWriter(blobWriter);
    const files = this.getFiles();
    await Promise.all(
      Object.entries(files).map(([fileName, content]) => {
        return zipWriter.add(fileName, content);
      })
    );
    await zipWriter.close();
    await terminateWorkers();
    return (await blobWriter.getData()).stream();
  }
}

/**
 * The project.json representation of a project.
 */
export type JSONProject = {
  targets: JSONTarget[];
  monitors: unknown;
  extensions: string[];
  extensionURLs: Record<string, string>;
  meta: {
    semver: "3.0.0";
    vm: string;
    agent: string;
  };
};
