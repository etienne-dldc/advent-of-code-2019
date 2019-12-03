import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

partTwo();

async function partOne() {
  const input = await readFileStr(
    path.resolve(Deno.cwd(), `src/inputs/03.txt`)
  );

  // const input = `R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51\nU98,R91,D20,R16,D67,R40,U7,R15,U6,R7`;

  const [wire1, wire2] = input
    .split("\n")
    .filter(v => v.length)
    .map(v => v.split(","));

  const [grid1, grid2] = [wire1, wire2].map(wire => {
    let x = 0;
    let y = 0;
    const grid = new Set<string>();
    wire.forEach(step => {
      const direction = step[0];
      const count = parseInt(step.slice(1), 10);
      for (let i = 0; i < count; i++) {
        switch (direction) {
          case "U":
            y -= 1;
            break;
          case "L":
            x -= 1;
            break;
          case "R":
            x += 1;
            break;
          case "D":
            y += 1;
            break;
          default:
            throw new Error(`Invalid direction ${direction}`);
        }
        const pos = `${x}_${y}`;
        grid.add(pos);
      }
    });
    return grid;
  });

  const all = new Set<string>();
  grid1.forEach(v => all.add(v));
  grid2.forEach(v => all.add(v));
  const intersect = new Set<string>();
  all.forEach(v => {
    if (grid1.has(v) && grid2.has(v)) {
      intersect.add(v);
    }
  });
  let closest = null;
  let closestDist = null;
  intersect.forEach(v => {
    const [x, y]= v.split('_').map(v => parseInt(v, 10));
    const dist = Math.abs(x) + Math.abs(y);
    if (closestDist === null) {
      closest = {x, y};
      closestDist = dist;
    } else {
      if (dist < closestDist) {
        closest = {x, y};
        closestDist = dist;
      }
    }
  });

  console.log(closest);
  console.log(closestDist);
  

}

async function partTwo() {
  const input = await readFileStr(
    path.resolve(Deno.cwd(), `src/inputs/03.txt`)
  );

  // const input = `R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51\nU98,R91,D20,R16,D67,R40,U7,R15,U6,R7`;

  const [wire1, wire2] = input
    .split("\n")
    .filter(v => v.length)
    .map(v => v.split(","));

  const [grid1, grid2] = [wire1, wire2].map(wire => {
    let x = 0;
    let y = 0;
    let steps = 0;
    const grid = new Map<string, number>();
    wire.forEach(step => {
      const direction = step[0];
      const count = parseInt(step.slice(1), 10);
      for (let i = 0; i < count; i++) {
        steps++;
        switch (direction) {
          case "U":
            y -= 1;
            break;
          case "L":
            x -= 1;
            break;
          case "R":
            x += 1;
            break;
          case "D":
            y += 1;
            break;
          default:
            throw new Error(`Invalid direction ${direction}`);
        }
        const pos = `${x}_${y}`;
        if (grid.has(pos) === false) {
          grid.set(pos, steps);
        }
      }
    });
    return grid;
  });

  const all = new Set<string>([...grid1.keys(), ...grid2.keys()]);
  const intersect = new Map<string, number>();
  all.forEach(v => {
    if (grid1.has(v) && grid2.has(v)) {
      intersect.set(v, grid1.get(v) + grid2.get(v));
    }
  });
  let closest = null;
  let closestDist = null;
  intersect.forEach((v, k) => {
    const [x, y]= k.split('_').map(v => parseInt(v, 10));
    const dist = v;
    if (closestDist === null) {
      closest = {x, y};
      closestDist = dist;
    } else {
      if (dist < closestDist) {
        closest = {x, y};
        closestDist = dist;
      }
    }
  });

  console.log(closest);
  console.log(closestDist);

}
