import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

(async () => {
  let input = await readFileStr(path.resolve(Deno.cwd(), `src/inputs/13.txt`));

  const program = input
  .split("\n")[0]
  .split(",")
  .reduce<Program>((acc, val, index) => {
    acc.set(BigInt(index), BigInt(val));
    return acc;
  }, new Map());

  const screen = new Map<string, bigint>();

  let mode: "x" | "y" | "id" = "x";

  let x = BigInt(0);
  let y = BigInt(0);

  Intcode(program, {
    onInput: _i => {
      console.log('input ?');
      return BigInt(0);
    },
    onOutput: v => {
      if (mode === "x") {
        x = v;
        mode = 'y';
      } else if (mode === 'y') {
        y = v;
        mode = 'id';
      } else if (mode === 'id') {
        screen.set(`${x}_${y}`, v);
        mode = 'x';
      } else {
        throw new Error('Inavlid mode')
      }
    },
    onHalt: () => {
      console.log("done");
    }
  });

  let blockCount = 0;
  screen.forEach((v, k) => {
    if (v === BigInt(2)) {
      blockCount++;
    }
  });



  console.log({ blockCount });

})();



interface Options {
  // onInput: (index: number, next: (val: bigint) => void) => void;
  onInput: (index: number) => bigint;
  onOutput?: (val: bigint) => void;
  onHalt?: () => void;
}

type Program = Map<bigint, bigint>;

function Intcode(program: Program, options: Options) {
  const { onInput, onOutput = () => {}, onHalt = () => {} } = options;

  let inputIndex = 0;
  let relativeBase = BigInt(0);

  function runLoop(initCursor: bigint) {
    let nextCurstor: bigint | false = initCursor;
    while (nextCurstor !== false) {
      nextCurstor = loop(nextCurstor);
    }
  }

  function loop(cursor: bigint): false | bigint {
    const opcode = decodeOpcode(
      program,
      relativeBase,
      cursor,
      readMemory(program, cursor)
    );
    if (opcode.type === BigInt(1)) {
      // Add
      const num1 = opcode.get(1);
      const num2 = opcode.get(2);
      opcode.set(3, num1 + num2);
      return cursor + BigInt(4);
    }
    if (opcode.type === BigInt(2)) {
      // Multiply
      const num1 = opcode.get(1);
      const num2 = opcode.get(2);
      opcode.set(3, num1 * num2);
      return cursor + BigInt(4);
    }
    if (opcode.type === BigInt(3)) {
      // Input
      const index = inputIndex;
      inputIndex++;
      opcode.set(1, onInput(index));
      return cursor + BigInt(2);
    }
    if (opcode.type === BigInt(4)) {
      // Output
      onOutput(opcode.get(1));
      return cursor + BigInt(2);
    }
    if (opcode.type === BigInt(5)) {
      // jump-if-true
      const param = opcode.get(1);
      if (param !== BigInt(0)) {
        return opcode.get(2);
      }
      return cursor + BigInt(3);
    }
    if (opcode.type === BigInt(6)) {
      // jump-if-false
      const param = opcode.get(1);
      if (param === BigInt(0)) {
        return opcode.get(2);
      }
      return cursor + BigInt(3);
    }
    if (opcode.type === BigInt(7)) {
      // less than
      const param1 = opcode.get(1);
      const param2 = opcode.get(2);
      opcode.set(3, BigInt(param1 < param2 ? 1 : 0));
      return cursor + BigInt(4);
    }
    if (opcode.type === BigInt(8)) {
      // equals
      const param1 = opcode.get(1);
      const param2 = opcode.get(2);
      opcode.set(3, BigInt(param1 === param2 ? 1 : 0));
      return cursor + BigInt(4);
    }
    if (opcode.type === BigInt(9)) {
      // relative base offset
      relativeBase += opcode.get(1);
      return cursor + BigInt(2);
    }
    if (opcode.type === BigInt(99)) {
      onHalt();
      return false;
    }
    throw new Error(`Invalid opcode ${opcode.raw}`);
  }

  runLoop(BigInt(0));
}

function readMemory(program: Program, key: bigint): bigint {
  if (program.has(key) === false) {
    return BigInt(0);
  }
  if (key < BigInt(0)) {
    throw new Error(`Invalid memory address ${key}`);
  }
  return program.get(key);
}

function decodeOpcode(
  program: Program,
  relativeBase: bigint,
  cursor: bigint,
  code: bigint
): {
  raw: bigint;
  type: bigint;
  get(num: number): bigint;
  set(num: number, value: bigint): void;
} {
  const type = code % BigInt(100);
  const argsMode = code
    .toString()
    .split("")
    .reverse()
    .slice(2)
    .map(v => parseInt(v, 10));

  return {
    raw: code,
    type,
    get: num => {
      const mode = argsMode[num - 1] || 0;
      const val = readMemory(program, cursor + BigInt(num));
      if (mode === 0) {
        return readMemory(program, val);
      }
      if (mode === 1) {
        return val;
      }
      if (mode === 2) {
        return readMemory(program, relativeBase + val);
      }
      throw new Error(`Invalid mode ${mode}`);
    },
    set: (num, value) => {
      const mode = argsMode[num - 1] || 0;
      const val = readMemory(program, cursor + BigInt(num));
      if (mode === 0) {
        program.set(val, value);
        return;
      }
      if (mode === 2) {
        program.set(relativeBase + val, value);
        return;
      }
      console.log({ code, argsMode, num });

      throw new Error(`Invalid mode ${mode}`);
    }
  };
}
