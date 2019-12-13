import inputPath from './inputs/13.txt'

(async () => {
  let input = await fetch(inputPath).then(res => res.text());

  const program = input
  .split("\n")[0]
  .split(",")
  .reduce<Program>((acc, val, index) => {
    acc.set(BigInt(index), BigInt(val));
    return acc;
  }, new Map());

  // Insert free money !
  program.set(BigInt(0), BigInt(2));

  let leftDown = false;
  let rightDown = false;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      leftDown = true;
    }
    if (e.key === 'ArrowRight') {
      rightDown = true;
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
      leftDown = false;
    }
    if (e.key === 'ArrowRight') {
      rightDown = false;
    }
  });

  const root = document.getElementById('app');
  console.log(root);
  const score = document.createElement('p');
  root.appendChild(score);
  const grid = document.createElement('div');
  grid.style.position = "relative";
  root.appendChild(grid);

  const tiles = new Map<string, any>();
  
  let ball = null;
  let paddle = null;

  const drawTile = (x: bigint, y: bigint, id: bigint) => {
    const key = `${x}_${y}`;
    let tile = tiles.get(key)
    if (!tile) {
      tile = document.createElement('div');
      tile.style.position = 'absolute';
      tile.style.left = `${Number(x) * 20}px`;
      tile.style.top = `${Number(y) * 20}px`;
      tile.style.height = `20px`;
      tile.style.width = `20px`;
      grid.appendChild(tile);
    }
    if (id === BigInt(0)) {
      // empty
      tile.style.background = 'white'
    } else if (id === BigInt(1)) {
      // wall
      tile.style.background = 'black'
    } else if (id === BigInt(2)) {
      // block
      tile.style.background = '#42A5F5'
    } else if (id === BigInt(3)) {
      // horizontal paddle
      paddle = x;
      tile.style.background = '#4CAF50'
    } else if (id === BigInt(4)) {
      // ball
      ball = x;
      tile.style.background = '#F44336';
    }
  }


  let mode: "x" | "y" | "id" = "x";

  let x = BigInt(0);
  let y = BigInt(0);

  Intcode(program, {
    onInput: (_i, next) => {
      window.setTimeout(() => {
        if (ball === paddle) {
          next(BigInt(0))
        } else if (ball < paddle) {
          next(BigInt(-1))
        } else if (ball > paddle) {
          next(BigInt(1))
        }
      }, 0);
    },
    onOutput: v => {
      if (mode === "x") {
        x = v;
        mode = 'y';
      } else if (mode === 'y') {
        y = v;
        mode = 'id';
      } else if (mode === 'id') {
        if (x === BigInt(-1) && y === BigInt(0)) {
          score.innerText = Number(v);
        } else {
          drawTile(x, y, v);
        }
        mode = 'x';
      } else {
        throw new Error('Inavlid mode')
      }
    },
    onHalt: () => {
      console.log("done");
    }
  });

//   let blockCount = 0;
//   screen.forEach((v, k) => {
//     if (v === BigInt(2)) {
//       blockCount++;
//     }
//   });



//   console.log({ blockCount });

})();



interface Options {
  onInput: (index: number, next: (val: bigint) => void) => void;
  // onInput: (index: number) => bigint;
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
      onInput(index, (val) => {
        opcode.set(1, val);
        runLoop(cursor + BigInt(2))
      });
      return false;
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
