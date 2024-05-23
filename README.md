# @mbw/sb3

A JavaScript library to create and export Scratch projects and sprites.

```ts
import { Target } from "./target.ts";
import { block, Script } from "./script.ts";
import { Project } from "./project.ts";

const EMPTY_SVG = new TextEncoder().encode(
  String.raw`<svg version="1.1" width="0" height="0" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>`
);

const project = new Project();

const sprite = new Target("sprite");
sprite.costumes.push({
  name: "Blank",
  file: EMPTY_SVG,
  type: "svg",
});
sprite.addScript(
  new Script().push(
    block("looks_sayforsecs", {
      inputs: {
        MESSAGE: { type: 10, value: "Hello!" },
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

Deno.writeFile("project.sb3", await project.zip());
```
