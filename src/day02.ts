import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

partTwo();

async function partOne() {
  const input = await readFileStr(
    path.resolve(Deno.cwd(), `src/inputs/02.txt`)
  );
  const arr = input
    .split("\n")[0]
    .split(",")
    .map(v => parseInt(v, 10));

  // set up
  arr[1] = 12;
  arr[2] = 2;

  let safe = 100000;

  let cursor = 0;
  while (arr[cursor] !== 99 && safe > 0) {
    safe--;
    const opcode = arr[cursor];
    if (opcode === 1) {
      const num1 = arr[arr[cursor + 1]];
      const num2 = arr[arr[cursor + 2]];
      arr[arr[cursor + 3]] = num1 + num2;
      cursor += 4;
    } else if (opcode === 2) {
      const num1 = arr[arr[cursor + 1]];
      const num2 = arr[arr[cursor + 2]];
      arr[arr[cursor + 3]] = num1 * num2;
      cursor += 4;
    } else {
      throw new Error(`Invalid opcode ${opcode}`);
    }
  }

  console.log(arr[0]);
}

async function partTwo() {
  const input = await readFileStr(
    path.resolve(Deno.cwd(), `src/inputs/02.txt`)
  );

  const baseMemory = input
    .split("\n")[0]
    .split(",")
    .map(v => parseInt(v, 10));

  function run(noun: number, verb: number): number {
    const memory = [...baseMemory];
    // set up
    memory[1] = noun;
    memory[2] = verb;

    let safe = 100000;

    let instructionPointer = 0;
    while (memory[instructionPointer] !== 99 && safe > 0) {
      safe--;
      const opcode = memory[instructionPointer];
      if (opcode === 1) {
        const num1 = memory[memory[instructionPointer + 1]];
        const num2 = memory[memory[instructionPointer + 2]];
        memory[memory[instructionPointer + 3]] = num1 + num2;
        instructionPointer += 4;
      } else if (opcode === 2) {
        const num1 = memory[memory[instructionPointer + 1]];
        const num2 = memory[memory[instructionPointer + 2]];
        memory[memory[instructionPointer + 3]] = num1 * num2;
        instructionPointer += 4;
      } else {
        throw new Error(`Invalid opcode ${opcode}`);
      }
    }

    return memory[0];
  }

  let found = false;
  for (let noun = 0; noun < 99; noun++) {
    for (let verb = 0; verb < 99; verb++) {
      const res = run(noun, verb);
      found = res === 19690720;
      if (found) {
        console.log({ noun, verb });
        break;
      }
    }
    if (found) {
      break;
    } 
  }

}
