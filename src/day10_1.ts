import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

(async () => {
  let input = await readFileStr(path.resolve(Deno.cwd(), `src/inputs/10.txt`));

  const map = input
    .split("\n")
    .filter(v => v.length)
    .map(line => line.split("").map(v => (v === "." ? 0 : 1)));

  const asteroids = new Map<string, { x: number; y: number }>();

  map.forEach((line, y) => {
    line.forEach((item, x) => {
      if (item === 1) {
        asteroids.set(`${x}_${y}`, { x, y });
      }
    });
  });

  let max: number = 0;
  let maxCoord: Point;

  asteroids.forEach((origin, key) => {
    const directions = new Set<number>();
    asteroids.forEach((target, targetKey) => {
      if (targetKey !== key) {        
        directions.add(getLine(origin, target));
        // console.log({
        //   p1: origin,
        //   p2: target,
        //   line: getLine(origin, target)
        // });
      }
    });
    console.log(origin, directions.size);
    if (directions.size > max) {
      max = directions.size;
      maxCoord = origin;
    }
  });

  console.log({
    max,
    maxCoord
  });

})();

interface Point {
  x: number;
  y: number;
}

function getLine(p1: Point, p2: Point): number {
  const fromZero: Point = {
    x: p2.x - p1.x,
    y: p2.y - p1.y,
  }

  const origin = { x: 0, y: 0 };

  const angleDeg = Math.atan2(fromZero.y - origin.y, fromZero.x - origin.x) * 180 / Math.PI;
  return angleDeg;
}
