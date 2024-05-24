# @mbw/sb3

Abstractions for creating and exporting [Scratch](https://scratch.mit.edu)
project (.sb3) files.

> [!NOTE]
> This package is not affiliated with Scratch or the Scratch foundation.

> [!WARNING]
> The .d.ts files for the block function are currently broken.

```ts
import { block, Script, Project, Target } from "@mbw/sb3";

using EMPTY_FILE = await Deno.open("./empty.svg");
const EMPTY_SVG = EMPTY_FILE.readable;

const project = new Project();

const sprite = new Target("sprite");
sprite.costumes.push({
  name: "Blank",
  file: EMPTY_SVG,
  type: "svg",
});
sprite.addScript(
  new Script({ topLevel: true }).push(block("event_whenflagclicked")).push(
    block("looks_sayforsecs", {
      inputs: {
        MESSAGE: { type: 10, value: "Hello, world!" },
        SECS: { type: 4, value: "2" },
      },
    })
  )
);
project.addTarget(sprite);

const stage = new Target();
stage.costumes.push({
  name: "Blank",
  file: EMPTY_SVG,
  type: "svg",
});
project.addTarget(stage);

const zip = await project.zip();
await Deno.writeFile("project.sb3", zip);
```
