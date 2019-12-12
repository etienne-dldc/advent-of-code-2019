import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

(async () => {
  let input = await readFileStr(path.resolve(Deno.cwd(), `src/inputs/12.txt`));
  // input = `<x=-8, y=-10, z=0>\n<x=5, y=5, z=10>\n<x=2, y=-7, z=3>\n<x=9, y=-8, z=-3>`;
  // input = `<x=-1, y=0, z=2>\n<x=2, y=-10, z=-7>\n<x=4, y=-8, z=8>\n<x=3, y=5, z=-1>`;

  const moons = input
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
        },
      };
    });

  const logMoons = () => {
    console.group("moons");
    moons.forEach(moon => console.log(`pos=<x=${moon.position.x}, y=${moon.position.y}, z=${moon.position.z}>, vel=<x=${moon.velocity.x}, y=${moon.velocity.y}, z=${moon.velocity.z}>`));
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

  for (let i = 1; i <= 1000; i++) {
    groups.forEach(([i1, i2]) => {
      dims.forEach(dim => {
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
    });
    moons.forEach(moon => {
      dims.forEach(dim => {
        moon.position[dim] += moon.velocity[dim];
      });
    });
    // console.log("=====", i);
    // logMoons();
  }

  // compute energy
  const totalEnergy = moons.reduce((acc, moon) => {
    const pot = dims.map(dim => Math.abs(moon.position[dim])).reduce((acc, i) => acc + i, 0);
    const kin = dims.map(dim => Math.abs(moon.velocity[dim])).reduce((acc, i) => acc + i, 0);
    const energy = pot * kin;
    return acc + energy;
  }, 0);

  console.log({ totalEnergy });
  

})();

/*

After 0 steps:
pos=<x=-1, y=  0, z= 2>, vel=<x= 0, y= 0, z= 0>
pos=<x= 2, y=-10, z=-7>, vel=<x= 0, y= 0, z= 0>
pos=<x= 4, y= -8, z= 8>, vel=<x= 0, y= 0, z= 0>
pos=<x= 3, y=  5, z=-1>, vel=<x= 0, y= 0, z= 0>

After 1 step:
pos=<x= 2, y=-1, z= 1>, vel=<x= 3, y=-1, z=-1>
pos=<x= 3, y=-7, z=-4>, vel=<x= 1, y= 3, z= 3>
pos=<x= 1, y=-7, z= 5>, vel=<x=-3, y= 1, z=-3>
pos=<x= 2, y= 2, z= 0>, vel=<x=-1, y=-3, z= 1>

After 2 steps:
pos=<x= 5, y=-3, z=-1>, vel=<x= 3, y=-2, z=-2>
pos=<x= 1, y=-2, z= 2>, vel=<x=-2, y= 5, z= 6>
pos=<x= 1, y=-4, z=-1>, vel=<x= 0, y= 3, z=-6>
pos=<x= 1, y=-4, z= 2>, vel=<x=-1, y=-6, z= 2>

After 3 steps:
pos=<x= 5, y=-6, z=-1>, vel=<x= 0, y=-3, z= 0>
pos=<x= 0, y= 0, z= 6>, vel=<x=-1, y= 2, z= 4>
pos=<x= 2, y= 1, z=-5>, vel=<x= 1, y= 5, z=-4>
pos=<x= 1, y=-8, z= 2>, vel=<x= 0, y=-4, z= 0>

After 4 steps:
pos=<x= 2, y=-8, z= 0>, vel=<x=-3, y=-2, z= 1>
pos=<x= 2, y= 1, z= 7>, vel=<x= 2, y= 1, z= 1>
pos=<x= 2, y= 3, z=-6>, vel=<x= 0, y= 2, z=-1>
pos=<x= 2, y=-9, z= 1>, vel=<x= 1, y=-1, z=-1>

After 5 steps:
pos=<x=-1, y=-9, z= 2>, vel=<x=-3, y=-1, z= 2>
pos=<x= 4, y= 1, z= 5>, vel=<x= 2, y= 0, z=-2>
pos=<x= 2, y= 2, z=-4>, vel=<x= 0, y=-1, z= 2>
pos=<x= 3, y=-7, z=-1>, vel=<x= 1, y= 2, z=-2>

After 10 steps:
pos=<x= 2, y= 1, z=-3>, vel=<x=-3, y=-2, z= 1>
pos=<x= 1, y=-8, z= 0>, vel=<x=-1, y= 1, z= 3>
pos=<x= 3, y=-6, z= 1>, vel=<x= 3, y= 2, z=-3>
pos=<x= 2, y= 0, z= 4>, vel=<x= 1, y=-1, z=-1>

*/
