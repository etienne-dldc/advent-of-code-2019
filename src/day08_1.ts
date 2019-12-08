import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

type Seq = [number, number, number, number, number];

(async () => {
  let input = await readFileStr(path.resolve(Deno.cwd(), `src/inputs/08.txt`));
  const nums = input
    .split("\n")[0]
    .split("")
    .map(v => parseInt(v, 10));

  const WIDTH = 25;
  const HEIGHT = 6;

  const SIZE = WIDTH * HEIGHT;
  const LAYERS_COUNT = nums.length / SIZE;

  const layers = range(LAYERS_COUNT).map(i =>
    nums.slice(i * SIZE, (i + 1) * SIZE)
  );

  let lessZeroLayer = null;
  let lessZero = Infinity;

  layers.forEach(layer => {
    const zeros = layer.filter(v => v === 0).length;
    if (zeros < lessZero) {
      lessZero = zeros;
      lessZeroLayer = layer;
    }
  });

  const twos = lessZeroLayer.filter(v => v === 2).length;
  const ones = lessZeroLayer.filter(v => v === 1).length;
  
  const result = twos * ones;

  console.log({ result });
})();

function range(size: number): Array<number> {
  return new Array(size).fill(null).map((v, i) => i);
}
