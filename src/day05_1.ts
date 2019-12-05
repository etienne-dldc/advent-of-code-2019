import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

(async () => {
  const input = await readFileStr(
    path.resolve(Deno.cwd(), `src/inputs/05.txt`)
  );

  const program = input
    .split("\n")[0]
    .split(",")
    .map(v => parseInt(v, 10));

  const output = Intcode(program, 1);
  console.log({ output });
})();

function Intcode(program: Array<number>, input: number): number | null {
  let safe = 100000;

  let cursor = 0;
  let prev = null;
  while (program[cursor] !== 99 && safe > 0) {
    safe--;
    const opcode = decodeOpcode(program, cursor, program[cursor]);
    if (opcode.type === 1) {
      const num1 = opcode.arg(1);
      const num2 = opcode.arg(2);

      // const op = program.slice(cursor, cursor + 4);
      // console.log(op);
      // console.log(op.slice(1).map(v => opcode.arg(v + 1)));
      // console.log("add result at " + program[cursor + 3], num1 + num2);

      program[program[cursor + 3]] = num1 + num2;
      cursor += 4;
    } else if (opcode.type === 2) {
      const num1 = opcode.arg(1);
      const num2 = opcode.arg(2);

      // const op = program.slice(cursor, cursor + 4);
      // console.log(op);
      // console.log(op.slice(1).map(v => opcode.arg(v + 1)));
      // console.log("multiply result at " + program[cursor + 3], num1 * num2);

      program[program[cursor + 3]] = num1 * num2;
      cursor += 4;
    } else if (opcode.type === 3) {
      // const op = program.slice(cursor, cursor + 2);
      // console.log(op);
      // console.log(op.slice(1).map(v => opcode.arg(v + 1)));
      // console.log("input at " + program[cursor + 1]);

      program[program[cursor + 1]] = input;
      cursor += 2;
    } else if (opcode.type === 4) {
      const output = opcode.arg(1);
      const next = program[cursor + 2];

      // const op = program.slice(cursor, cursor + 2);
      // console.log(op);
      // console.log(op.slice(1).map(v => opcode.arg(v + 1)));
      // console.log("output", output);

      if (next === 99) {
        return output;
      }
      if (output === 0) {
        console.log(cursor, "pass");
      } else {
        console.log(cursor, "error");
        console.log({ cursor, output, prev, next });
        throw new Error("Invalid output");
      }
      cursor += 2;
    } else {
      throw new Error(`Invalid opcode ${opcode}`);
    }
    prev = opcode;
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
