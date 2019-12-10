import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

(async () => {
  let input = await readFileStr(path.resolve(Deno.cwd(), `src/inputs/10.txt`));
//   input = `
// .#..##.###...#######
// ##.############..##.
// .#.######.########.#
// .###.#######.####.#.
// #####.##.#.##.###.##
// ..#####..#.#########
// ####################
// #.####....###.#.#.##
// ##.#################
// #####.##.###..####..
// ..######..##.#######
// ####.##.####...##..#
// .#####..#.######.###
// ##...#.##########...
// #.##########.#######
// .####.#.###.###.#.##
// ....##.##.###..#####
// .#.#.###########.###
// #.#.#.#####.####.###
// ###.##.####.##.#..##
// `;

  const map = input
    .split("\n")
    .filter(v => v.length)
    .map(line => line.split(""));

  let station = { x: 26, y: 28 };
  // station = { x: 11, y: 13 };

  const byAngle: Array<{
    angle: number;
    points: Array<{ coord: Point; dist: number }>;
  }> = [];

  map.forEach((line, y) => {
    line.forEach((item, x) => {
      if (item === "X") {
        return;
      }
      const coord = { x, y };
      if (item === "#" && (x !== station.x || y !== station.y)) {
        const angle = getAngle(station, coord);
        const dist = getDistance(station, coord);
        const angleObj = byAngle.find(v => v.angle === angle);
        if (!angleObj) {
          byAngle.push({
            angle,
            points: [{ coord, dist }]
          });
        } else {
          angleObj.points.push({ coord, dist });
        }
      }
    });
  });

  byAngle.forEach(obj => {
    obj.points.sort((left, right) => {
      return left.dist - right.dist;
    });
  });
  byAngle.sort((left, right) => {
    return left.angle - right.angle;
  });

  // byAngle.forEach(item => {
  //   console.log(item);
  // })

  const order: Array<Point> = [];

  while (true) {
    let loop = 0;
    let foundOne = false;
    byAngle.forEach(item => {
      if (item.points[loop]) {
        order.push(item.points[loop].coord);
        let foundOne = true;
      }
    });
    loop++;
    if (foundOne === false) {
      break;
    }
  }

  console.log(order[199]);
})();

interface Point {
  x: number;
  y: number;
}

function getAngle(p1: Point, p2: Point): number {
  const fromZero: Point = {
    x: p2.x - p1.x,
    y: p2.y - p1.y
  };
  const origin = { x: 0, y: 0 };
  const angleDeg =
    (Math.atan2(fromZero.y - origin.y, fromZero.x - origin.x) * 180) / Math.PI;
  return (angleDeg + 180 + 90 * 3) % 360;
}

function getDistance(p1: Point, p2: Point): number {
  const a = p1.x - p2.x;
  const b = p1.y - p2.y;

  return Math.sqrt(a * a + b * b);
}
