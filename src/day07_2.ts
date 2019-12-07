import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

type Seq = [number, number, number, number, number];

(async () => {
  let input = await readFileStr(path.resolve(Deno.cwd(), `src/inputs/07.txt`));
  // input = `3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,-5,54,1105,1,12,1,53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10`;

  const program = input
    .split("\n")[0]
    .split(",")
    .map(v => parseInt(v, 10));

  const seqs: Array<Seq> = allSeq([], [5, 6, 7, 8, 9]) as any;

  let max = -Infinity;
  let maxSeq = null;

  seqs.forEach(seq => {

    const a = createProg(program, "a", seq[0]);
    const b = createProg(program, "b", seq[1]);
    const c = createProg(program, "c", seq[2]);
    const d = createProg(program, "d", seq[3]);
    const e = createProg(program, "e", seq[4]);
    const prog = (input: number) => e(d(c(b(a(input)))));
  
    let res = prog(0);
    while((a as any).done === false) {
      res = prog(res);
    }

    if (res > max) {
      max = res;
      maxSeq = seq;
    }
    
  })
  
  console.log({ max, maxSeq });

})();

function createProg(
  program: Array<number>,
  name: string,
  phase: number
): (input: number) => number {
  let next;
  let out;
  let setupDone = false;

  Intcode(
    program,
    name,
    (index, n) => {
      if (setupDone === false) {
        setupDone = true;
        n(phase);
      } else {
        next = n;
      }
    },
    o => {
      out = o;
    },
    () => {
      run.done = true;
      console.log("=====>", name, "done");
    }
  );
  function run(input: number) {
    next(input);
    return out;
  }

  run.done = false;

  return run;
}

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

function Intcode(
  program: Array<number>,
  name: string,
  onInput: (index: number, next: (val: number) => void) => void,
  onOutput: (val: number) => void,
  onHalt: () => void
) {
  let inputIndex = 0;

  function loop(cursor: number) {
    const opcode = decodeOpcode(program, cursor, program[cursor]);
    if (opcode.type === 1) {
      // Add
      const num1 = opcode.arg(1);
      const num2 = opcode.arg(2);
      program[program[cursor + 3]] = num1 + num2;
      return loop(cursor + 4);
    }
    if (opcode.type === 2) {
      // Multiply
      const num1 = opcode.arg(1);
      const num2 = opcode.arg(2);
      program[program[cursor + 3]] = num1 * num2;
      return loop(cursor + 4);
    }
    if (opcode.type === 3) {
      // Input
      const index = inputIndex;
      inputIndex++;
      onInput(index, val => {
        // console.log(name, "in", val);
        program[program[cursor + 1]] = val;
        return loop(cursor + 2);
      });
      // console.log(name, 'wait for input');
      return;
    }
    if (opcode.type === 4) {
      // Output
      // console.log(name, "out", opcode.arg(1));
      onOutput(opcode.arg(1));
      return loop(cursor + 2);
    }
    if (opcode.type === 5) {
      // jump-if-true
      const param = opcode.arg(1);
      if (param !== 0) {
        return loop(opcode.arg(2));
      }
      return loop(cursor + 3);
    }
    if (opcode.type === 6) {
      // jump-if-false
      const param = opcode.arg(1);
      if (param === 0) {
        return loop(opcode.arg(2));
      }
      return loop(cursor + 3);
    }
    if (opcode.type === 7) {
      // less than
      const param1 = opcode.arg(1);
      const param2 = opcode.arg(2);
      program[program[cursor + 3]] = param1 < param2 ? 1 : 0;
      return loop(cursor + 4);
    }
    if (opcode.type === 8) {
      // equals
      const param1 = opcode.arg(1);
      const param2 = opcode.arg(2);
      program[program[cursor + 3]] = param1 === param2 ? 1 : 0;
      return loop(cursor + 4);
    }
    if (opcode.type === 99) {
      onHalt();
      return;
    }
    throw new Error(`Invalid opcode ${opcode.raw}`);
  }

  return loop(0);
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
