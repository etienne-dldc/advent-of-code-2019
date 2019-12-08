import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

type Seq = [number, number, number, number, number];

(async () => {
  let input = await readFileStr(path.resolve(Deno.cwd(), `src/inputs/08.txt`));
  // input = `0222112222120000`;
  const nums = input
    .split("\n")[0]
    .split("")
    .map(v => parseInt(v, 10));

  let WIDTH = 25;
  // WIDTH = 2;
  let HEIGHT = 6;
  // HEIGHT = 2;

  const SIZE = WIDTH * HEIGHT;
  const LAYERS_COUNT = nums.length / SIZE;

  const layers = range(LAYERS_COUNT).map(i =>
    nums.slice(i * SIZE, (i + 1) * SIZE)
  );

  const result = range(SIZE).map(i => {
    let layerIndex = 0;
    while (layers[layerIndex][i] === 2) {
      layerIndex++;
    }
    return layers[layerIndex][i];
  });

  const lines = range(HEIGHT).map(i =>
    result.slice(i * WIDTH, (i + 1) * WIDTH)
  );

  console.log(
    lines
      .map(line =>
        line.map(v => (v === 0 ? " " : v === 1 ? "■" : "x")).join("")
      )
      .join("\n")
  );
})();

function range(size: number): Array<number> {
  return new Array(size).fill(null).map((v, i) => i);
}
