import type { JSONTarget, Target } from "./target.ts";

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
      monitors: {},
      extensions: {},
      meta: {
        semver: "3.0.0",
        vm: "2.3.0",
        agent: this.userAgent,
      },
    };
  }
}

export type JSONProject = {
  targets: JSONTarget[];
  monitors: unknown;
  extensions: unknown;
  meta: {
    semver: "3.0.0";
    vm: string;
    agent: string;
  };
};
