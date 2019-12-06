import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

(async () => {
  let input = await readFileStr(path.resolve(Deno.cwd(), `src/inputs/06.txt`));

  // input = `COM)B\nB)C\nC)D\nD)E\nE)F\nB)G\nG)H\nD)I\nE)J\nJ)K\nK)L`;

  const relations = input
    .split("\n")
    .filter(v => v.length)
    .map((v): [string, string] => v.split(")").reverse() as any);
  const items = new Map<string, string>(relations);
  const all = new Set(
    relations.reduce((acc, item) => {
      acc.push(...item);
      return acc;
    }, [])
  );

  let sum = 0;
  all.forEach(item => {
    sum += countOrbits(item);
  });

  console.log({ sum });

  function countOrbits(item: string): number {
    if (item === "COM") {
      return 0;
    }
    const parent = items.get(item);
    return countOrbits(parent) + 1;
  }
})();
