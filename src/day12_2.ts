import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

(async () => {
  let input = await readFileStr(path.resolve(Deno.cwd(), `src/inputs/12.txt`));
  // input = `<x=-8, y=-10, z=0>\n<x=5, y=5, z=10>\n<x=2, y=-7, z=3>\n<x=9, y=-8, z=-3>`;
  // input = `<x=-1, y=0, z=2>\n<x=2, y=-10, z=-7>\n<x=4, y=-8, z=8>\n<x=3, y=5, z=-1>`;
  // input = `<x=-8, y=-10, z=0>\n<x=5, y=5, z=10>\n<x=2, y=-7, z=3>\n<x=9, y=-8, z=-3>`

  let moons = input
    .split("\n")
    .filter(v => v.length)
    .map(v => {
      const lineReg = /<x=(-?[0-9]+), y=(-?[0-9]+), z=(-?[0-9]+)>/g;
      const res = lineReg.exec(v);
      return {
        position: {
          x: parseInt(res[1], 10),
          y: parseInt(res[2], 10),
          z: parseInt(res[3], 10)
        },
        velocity: {
          x: 0,
          y: 0,
          z: 0
        }
      };
    });

  const moonsInit = JSON.stringify(moons);

  const logMoons = () => {
    console.group("moons");
    moons.forEach(moon =>
      console.log(
        `pos=<x=${moon.position.x}, y=${moon.position.y}, z=${moon.position.z}>, vel=<x=${moon.velocity.x}, y=${moon.velocity.y}, z=${moon.velocity.z}>`
      )
    );
    console.groupEnd();
  };

  console.log("=====", 0);
  logMoons();

  const groups = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
    [2, 3]
  ];

  const dims = ["x", "y", "z"] as const;

  const dimsRepeat = dims.map(dim => {
    moons = JSON.parse(moonsInit);
    const init = moons.map(moon => ({
      position: { ...moon.position },
      velocity: { ...moon.velocity }
    }));
    let loop = 0;
    while (true) {
      loop++;
      groups.forEach(([i1, i2]) => {
        const p1 = moons[i1].position[dim];
        const p2 = moons[i2].position[dim];
        if (p1 === p2) {
          return;
        }
        if (p1 > p2) {
          moons[i1].velocity[dim] -= 1;
          moons[i2].velocity[dim] += 1;
        } else {
          moons[i1].velocity[dim] += 1;
          moons[i2].velocity[dim] -= 1;
        }
      });
      moons.forEach(moon => {
        moon.position[dim] += moon.velocity[dim];
      });
      if (
        moons[0].position[dim] === init[0].position[dim] &&
        moons[0].velocity[dim] === init[0].velocity[dim] &&
        moons[1].position[dim] === init[1].position[dim] &&
        moons[1].velocity[dim] === init[1].velocity[dim] &&
        moons[2].position[dim] === init[2].position[dim] &&
        moons[2].velocity[dim] === init[2].velocity[dim] &&
        moons[3].position[dim] === init[3].position[dim] &&
        moons[3].velocity[dim] === init[3].velocity[dim]
      ) {
        break;
      }
    }
    return BigInt(loop);
  });

  console.log(dimsRepeat);

  let num1 = BigInt(0);
  while (true) {
    num1 += dimsRepeat[0];
    if (num1 % dimsRepeat[1] === BigInt(0)) {
      break;
    }
  };

  let num2 = BigInt(0);
  while (true) {
    num2 += num1;
    if (num2 % dimsRepeat[2] === BigInt(0)) {
      break;
    }
  };

  console.log({ num2 });

})();
