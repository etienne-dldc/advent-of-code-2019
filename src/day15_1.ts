import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";

interface Position {
  x: number;
  y: number;
}

(async () => {
  let input = await readFileStr(path.resolve(Deno.cwd(), `src/inputs/15.txt`));

  const program = input
    .split("\n")[0]
    .split(",")
    .reduce<Program>((acc, val, index) => {
      acc.set(BigInt(index), BigInt(val));
      return acc;
    }, new Map());

  const grid = new Map<string, number>();
  let pos: Position = {
    x: 0,
    y: 0
  };

  // 1 => north ^
  // 2 => south v
  // 3 => west <
  // 4 => east >

  let nextDirection: bigint = BigInt(2);
  const queue = new Set<string>(`0_0`);
  const moves: Array<bigint> = [];

  function setGrid(p: Position, val: number) {
    const key = `${p.x}_${p.y}`;
    if (queue.has(key)) {
      queue.delete(key);
    }
    if (!grid.has(key)) {
      grid.set(key, val);
    }
  }

  function update() {
    const next = getNextPos();
    const coods = [
      `${pos.x - 1}_${pos.y}`,
      `${pos.x + 1}_${pos.y}`,
      `${pos.x}_${pos.y - 1}`,
      `${pos.x}_${pos.y + 1}`
    ];
    const around = coods.map(key => grid.get(key));
    const direction = [BigInt(3), BigInt(4), BigInt(1), BigInt(2)];

    coods.forEach(key => {
      if (!grid.has(key)) {
        queue.add(key);
      }
    });

    if (around.indexOf(undefined) >= 0) {
      nextDirection = direction[around.indexOf(undefined)];
      return;
    }
    // all defined => inverse last move
    const lastMove = moves.pop();
    console.log("pop", moveName(lastMove));
    if (lastMove !== undefined) {
      const dir = [BigInt(1), BigInt(2), BigInt(3), BigInt(4)];
      const inversedir = [BigInt(2), BigInt(1), BigInt(4), BigInt(3)];
      nextDirection = inversedir[dir.indexOf(lastMove)];
      console.log(nextDirection);
    } else {
      //
      console.log(pos);
      throw new Error("");
    }
  }

  function move() {
    pos = getNextPos();
  }

  function moveName(move: bigint): string {
    const dir = [BigInt(1), BigInt(2), BigInt(3), BigInt(4)];
    const names = ["up", "down", "left", "right"];
    return names[dir.indexOf(move)];
  }

  function getNextPos(): Position {
    if (nextDirection === BigInt(1)) {
      // north
      return { y: pos.y - 1, x: pos.x };
    }
    if (nextDirection === BigInt(2)) {
      // south
      return { y: pos.y + 1, x: pos.x };
    }
    if (nextDirection === BigInt(3)) {
      // west
      return { y: pos.y, x: pos.x - 1 };
    }
    if (nextDirection === BigInt(4)) {
      // east
      return { y: pos.y, x: pos.x + 1 };
    }
    throw new Error(`Invalid nextDirection`);
  }

  let limit = 0;

  Intcode(program, {
    onInput: _i => {
      limit++;
      if (limit > 20 || queue.size === 0) {
        console.log("stop");
        return STOP;
      }
      console.log("in", moveName(nextDirection));
      return nextDirection;
    },
    onOutput: (v, i) => {
      console.log("out", v);
      if (v === BigInt(0)) {
        setGrid(getNextPos(), 0);
      } else if (v === BigInt(1)) {
        setGrid(getNextPos(), 1);
        console.log("push", moveName(nextDirection));
        moves.push(nextDirection);
        move();
      } else if (v === BigInt(2)) {
        // console.log("found oxygen", getNextPos());
        setGrid(getNextPos(), 2);
        console.log("push", moveName(nextDirection));
        moves.push(nextDirection);
        move();
      }
      update();
      // if (i % 100 === 0) {
      //   console.log(queue.size);
      // }
      printGrid();
    },
    onHalt: () => {
      console.log("done");
    }
  });

  function printGrid() {
    const allX = Array.from(grid.keys()).map(v =>
      parseInt(v.split("_")[0], 10)
    );
    const allY = Array.from(grid.keys()).map(v =>
      parseInt(v.split("_")[1], 10)
    );
    const useFixedSize = true;
    const size = 4;
    const minX = useFixedSize ? -size : Math.min(...allX);
    const maxX = useFixedSize ? size : Math.max(...allX);
    const minY = useFixedSize ? -size : Math.min(...allY);
    const maxY = useFixedSize ? size : Math.max(...allY);
    let str = "";
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        const key = `${x}_${y}`;
        if (x === pos.x && y === pos.y) {
          str += "o";
        } else if (!grid.has(key)) {
          str += " ";
        } else {
          const val = grid.get(key);
          if (val === 0) {
            str += "#";
          } else if (val === 1) {
            str += ".";
          } else if (val === 2) {
            str += "@";
          } else {
            throw new Error("Invalid val");
          }
        }
      }
      str += "\n";
    }
    console.log(str);
  }

  printGrid();

  console.log(queue.size);
  console.log(grid.size);

  // console.log(grid);
})();

const STOP = Symbol("STOP");

interface Options {
  // onInput: (index: number, next: (val: bigint) => void) => void;
  onInput: (index: number) => bigint | typeof STOP;
  onOutput?: (val: bigint, index: number) => void;
  onHalt?: () => void;
}

type Program = Map<bigint, bigint>;

function Intcode(program: Program, options: Options) {
  const { onInput, onOutput = () => {}, onHalt = () => {} } = options;

  let inputIndex = 0;
  let outputIndex = 0;
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
      const input = onInput(index);
      if (input === STOP) {
        return false;
      }
      opcode.set(1, input);
      return cursor + BigInt(2);
    }
    if (opcode.type === BigInt(4)) {
      // Output
      const index = outputIndex;
      outputIndex++;
      onOutput(opcode.get(1), index);
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
