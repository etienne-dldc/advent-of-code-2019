import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

type Seq = [number, number, number, number, number];

(async () => {
  let input = await readFileStr(path.resolve(Deno.cwd(), `src/inputs/07.txt`));
  // input = `3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0`;

  const program = input
    .split("\n")[0]
    .split(",")
    .map(v => parseInt(v, 10));

  const seqs: Array<Seq> = allSeq([], [0, 1, 2, 3, 4]) as any;
  let max: number = -Infinity;
  let maxSeq: Seq | null = null;

  seqs.forEach(seq => {
    const o1 = run(program, [seq[0], 0]);
    const o2 = run(program, [seq[1], o1]);
    const o3 = run(program, [seq[2], o2]);
    const o4 = run(program, [seq[3], o3]);
    const o5 = run(program, [seq[4], o4]);
    if (o5 > max) {
      max = o5;
      maxSeq = seq;
    }
  });

  console.log({
    max,
    maxSeq
  });
})();

function allSeq(
  start: Array<number>,
  rest: Array<number>
): Array<Array<number>> {
  if (rest.length === 0) {
    return [start];
  }
  const result: Array<Array<number>> = [];
  rest.forEach(num => {
    const next = allSeq(
      [...start, num],
      rest.filter(v => v !== num)
    );
    result.push(...next);
  });
  return result;
}

function run(program: Array<number>, inputs: [number, number]): number {
  let result = 0;
  Intcode(
    program,
    index => {
      return inputs[index];
    },
    out => {
      result = out;
    }
  );
  return result;
}

function Intcode(
  program: Array<number>,
  onInput: (index: number) => number,
  onOutput: (num: number) => void
): number | null {
  let safe = 100000;

  let inputIndex = 0;
  let cursor = 0;
  while (program[cursor] !== 99 && safe > 0) {
    safe--;
    const opcode = decodeOpcode(program, cursor, program[cursor]);
    if (opcode.type === 1) {
      // Add
      const num1 = opcode.arg(1);
      const num2 = opcode.arg(2);
      program[program[cursor + 3]] = num1 + num2;
      cursor += 4;
    } else if (opcode.type === 2) {
      // Multiply
      const num1 = opcode.arg(1);
      const num2 = opcode.arg(2);
      program[program[cursor + 3]] = num1 * num2;
      cursor += 4;
    } else if (opcode.type === 3) {
      // Input
      program[program[cursor + 1]] = onInput(inputIndex);
      inputIndex += 1;
      cursor += 2;
    } else if (opcode.type === 4) {
      // Output
      const output = opcode.arg(1);
      onOutput(output);
      cursor += 2;
    } else if (opcode.type === 5) {
      // jump-if-true
      const param = opcode.arg(1);
      if (param !== 0) {
        cursor = opcode.arg(2);
      } else {
        cursor += 3;
      }
    } else if (opcode.type === 6) {
      // jump-if-false
      const param = opcode.arg(1);
      if (param === 0) {
        cursor = opcode.arg(2);
      } else {
        cursor += 3;
      }
    } else if (opcode.type === 7) {
      // less than
      const param1 = opcode.arg(1);
      const param2 = opcode.arg(2);
      program[program[cursor + 3]] = param1 < param2 ? 1 : 0;
      cursor += 4;
    } else if (opcode.type === 8) {
      // equals
      const param1 = opcode.arg(1);
      const param2 = opcode.arg(2);
      program[program[cursor + 3]] = param1 === param2 ? 1 : 0;
      cursor += 4;
    } else {
      throw new Error(`Invalid opcode ${opcode.raw}`);
    }
  }

  return null;
}

function decodeOpcode(
  program: Array<number>,
  cursor: number,
  code: number
): { raw: number; type: number; arg(num: number): number } {
  if (code < 100) {
    return {
      raw: code,
      type: code,
      arg: num => program[program[cursor + num]]
    };
  }
  const type = code % 100;
  const argsMode = code
    .toString()
    .split("")
    .reverse()
    .slice(2)
    .map(v => (v === "1" ? 1 : 0));

  return {
    raw: code,
    type,
    arg: num =>
      argsMode[num - 1] === 1
        ? program[cursor + num]
        : program[program[cursor + num]]
  };
}
