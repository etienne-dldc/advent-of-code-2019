import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

(async () => {
  let input = await readFileStr(path.resolve(Deno.cwd(), `src/inputs/06.txt`));

  // input = `COM)B\nB)C\nC)D\nD)E\nE)F\nB)G\nG)H\nD)I\nE)J\nJ)K\nK)L\nK)YOU\nI)SAN`;

  const relations = input
    .split("\n")
    .filter(v => v.length)
    .map((v): [string, string] => v.split(")").reverse() as any);
  const items = new Map<string, string>(relations);

  const santaParents = allParents('SAN');
  const youParents = allParents('YOU');

  let commonAncestor = 'COM';
  while (true) {
    if (santaParents[0] === youParents[0]) {
      commonAncestor = santaParents[0];
      youParents.shift();
      santaParents.shift();
    } else {
      break;
    }
  }

  const sum = santaParents.length + youParents.length;

  console.log({ sum });

  function allParents(item: string): Array<string> {
    if (item === "COM") {
      return [];
    }
    const parent = items.get(item);
    return [...allParents(parent), parent];
  }
})();
