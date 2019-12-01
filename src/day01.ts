import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

partTwo();

async function partOne () {
  const input = await readFileStr(path.resolve(Deno.cwd(), `src/inputs/01.txt`));

  const modules = input
    .split("\n")
    .filter(v => !!v)
    .map(v => parseInt(v, 10));

  const result = modules.reduce<number>((acc, item) => {
    return acc + Math.floor(item / 3) - 2;
  }, 0);

  console.log(result);
};

async function partTwo () {
  const input = await readFileStr(path.resolve(Deno.cwd(), `src/inputs/01.txt`));

  const modules = input
    .split("\n")
    .filter(v => !!v)
    .map(v => parseInt(v, 10));

  const result = modules.map(item => {
    let fuel = Math.floor(item / 3) - 2;
    let total = fuel;
    while(fuel > 0) {
      fuel = Math.floor(fuel / 3) - 2;
      if (fuel > 0) {
        total += fuel;
      }
    }
    return total;
  }).reduce<number>((acc, item) => acc + item, 0);

  console.log(result);
};

partTwo();
