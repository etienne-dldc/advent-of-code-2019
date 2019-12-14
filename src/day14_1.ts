import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

type Chemicals = {
  [key: string]: number;
};

interface Reaction {
  inputs: {
    [key: string]: number;
  };
  output: {
    name: string;
    count: number;
  };
}

(async () => {
  let input = await readFileStr(path.resolve(Deno.cwd(), `src/inputs/14.txt`));
  //   input = `
  // 157 ORE => 5 NZVS
  // 165 ORE => 6 DCFZ
  // 44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL
  // 12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ
  // 179 ORE => 7 PSHF
  // 177 ORE => 5 HKGWZ
  // 7 DCFZ, 7 PSHF => 2 XJWVT
  // 165 ORE => 2 GPVTF
  // 3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT
  //   `;

  const reactions = input
    .split("\n")
    .filter(v => v.trim().length)
    .map(
      (str): Reaction => {
        const [inputs, outputs] = str.split("=>").map(items => {
          return items.split(",").reduce((acc, v) => {
            const [count, name] = v.trim().split(" ");
            acc[name] = parseInt(count, 10);
            return acc;
          }, {});
        });
        if (Object.keys(outputs).length !== 1) {
          throw new Error("More than one output");
        }
        const outputName = Object.keys(outputs)[0];
        return {
          output: {
            name: outputName,
            count: outputs[outputName]
          },
          inputs
        };
      }
    );

  const all = new Set<string>();
  reactions.forEach(reaction => {
    all.add(reaction.output.name);
    Object.keys(reaction.inputs).forEach(v => {
      all.add(v);
    });
  });

  const depsMap = new Map<string, Set<string>>();
  all.forEach(chem => {
    depsMap.set(chem, resolveDeps(chem));
  });

  function resolveDeps(chem: string): Set<string> {
    if (chem === "ORE") {
      return new Set();
    }
    const reaction = reactions.find(r => r.output.name === chem);
    const deps = Object.keys(reaction.inputs);
    const all = [
      ...deps,
      ...Object.keys(reaction.inputs)
        .map(c => Array.from(resolveDeps(c)))
        .flat(1)
    ];
    return new Set(all);
  }

  const order = ["ORE"];
  const queue = new Set(all);
  queue.delete("ORE");

  while (queue.size > 0) {
    const reaction = reactions.find(reaction => {
      const alreadyHandled = order.indexOf(reaction.output.name) >= 0;
      if (alreadyHandled) {
        return false;
      }
      const inputs = Object.keys(reaction.inputs);
      const allInOrder = inputs.every(input => order.indexOf(input) >= 0);
      return allInOrder;
    });
    order.push(reaction.output.name);
    queue.delete(reaction.output.name);
  }

  order.reverse();
  const rest: Chemicals = {};
  const used: Chemicals = { FUEL: 1 };

  order.forEach(chem => {
    if (chem === "ORE") {
      return;
    }
    const count = used[chem];
    // we need used [count] of [chem]
    const reaction = reactions.find(r => r.output.name === chem);
    // but one reaction produce [reaction.output.count] of [chem]
    const reactionCount = Math.ceil(count / reaction.output.count);
    const chemCount = reaction.output.count * reactionCount;
    const restCount = chemCount - count;
    if (!rest[chem]) {
      rest[chem] = 0;
    }
    rest[chem] += restCount;
    Object.keys(reaction.inputs).forEach(input => {
      const inputCount = reaction.inputs[input] * reactionCount;
      if (!used[input]) {
        used[input] = 0;
      }
      used[input] += inputCount;
    });
  });

  console.log(order);
  reactions.forEach(r => console.log(r));
  // console.log(JSON.stringify(used, null, 2));

  console.log(used.ORE);
})();
