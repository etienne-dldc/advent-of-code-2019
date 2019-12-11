import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

type Program = Map<bigint, bigint>;

(async () => {
  let input = await readFileStr(path.resolve(Deno.cwd(), `src/inputs/11.txt`));
  // input = ``;

  const program = input
    .split("\n")[0]
    .split(",")
    .reduce<Program>((acc, val, index) => {
      acc.set(BigInt(index), BigInt(val));
      return acc;
    }, new Map());

  const grid = new Map<string, boolean>();

  const readGrid = (x: number, y: number): boolean => {
    const key = `${x}_${y}`;
    if (grid.has(key)) {
      return grid.get(key);
    }
    if (x === 0 && y === 0) {
      return true;
    }
    return false;
  };

  const writeGrid = (x: number, y: number, val: boolean) => {
    const key = `${x}_${y}`;
    grid.set(key, val);
    // if (readGrid(x, y) !== val) {
    //   console.log('paint', x, y, val);
    // } else {
    //   console.log('skip', x, y, val)
    // }
  };

  // 0 us up then
  let direction = 0;
  const pos = { x: 0, y: 0 };

  let mode: "paint" | "turn" = "paint";

  const moveForward = () => {
    const dir =
      direction === 0
        ? "up"
        : direction === 90
        ? "right"
        : direction === 180
        ? "down"
        : direction === 270
        ? "left"
        : "error";
    if (dir === "error") {
      throw new Error(`Invalid direction ${direction}`);
    }
    // console.log(direction, dir);

    if (dir === "up") {
      pos.y -= 1;
    } else if (dir === "down") {
      pos.y += 1;
    } else if (dir === "left") {
      pos.x -= 1;
    } else if (dir === "right") {
      pos.x += 1;
    }
  };

  Intcode(program, {
    onInput: _i => {
      return BigInt(readGrid(pos.x, pos.y));
    },
    onOutput: v => {
      if (mode === "paint") {
        mode = "turn";
        // console.log(mode);
        // console.log(v, 'paint', pos.x, pos.y, v === BigInt(0) ? false : true);
        writeGrid(pos.x, pos.y, v === BigInt(0) ? false : true);
      } else {
        mode = "paint";
        if (v === BigInt(0)) {
          // turn 3 quarter
          // console.log(v, 'turn', 'left', (direction + 270) % 360);
          direction = (direction + 270) % 360;
        } else if (v === BigInt(1)) {
          // console.log(v, 'turn', 'right', (direction + 90) % 360);
          direction = (direction + 90) % 360;
        }
        moveForward();
      }
    },
    onHalt: () => {
      console.log("done");
    }
  });

  const xs = [];
  const ys = [];
  grid.forEach((v, k) => {
    const [x, y] = k.split("_").map(v => parseInt(v, 10));
    xs.push(x);
    ys.push(y);
  });

  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  console.log({
    xMin,
    xMax,
    yMin,
    yMax
  });

  let output = "";
  for (let y = yMin; y <= yMax; y++) {
    for (let x = xMin; x <= xMax; x++) {
      output += readGrid(x, y) ? "#" : " ";
    }
    output += "\n";
  }

  console.log(output);
  // #  # ####  ##  #### #  # ###  #    ###    
  // #  #    # #  # #    # #  #  # #    #  #   
  // #  #   #  #  # ###  ##   ###  #    #  #   
  // #  #  #   #### #    # #  #  # #    ###    
  // #  # #    #  # #    # #  #  # #    #      
  //  ##  #### #  # #### #  # ###  #### #      
})();

interface Options {
  // onInput: (index: number, next: (val: bigint) => void) => void;
  onInput: (index: number) => bigint;
  onOutput?: (val: bigint) => void;
  onHalt?: () => void;
}

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
