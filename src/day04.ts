partTwo();

async function partOne() {
  const input = "307237-769058";

  const range = input.split("-").map(v => parseInt(v, 10));

  const start = parseInt(
    range[0]
      .toString()
      .split("")
      .map(v => input[0])
      .join(""),
    10
  );

  let num = start;
  let count = 0;
  while (num < range[1]) {
    const match = num.toString().match(/(00|11|22|33|44|55|66|77|88|99)/);
    if (match) {
      count++;
    }
    num = addOne(num, 0);    
  }
  console.log({ count });

  function addOne(num: number, pos: number): number {
    const numStr = num.toString().split("");
    const val = parseInt(numStr[numStr.length - 1 - pos], 10);
    if (val === 9) {
      return addOne(num, pos + 1);
    }
    const next = (val + 1).toString();
    for (let i = 0; i <= pos; i++) {
      numStr[numStr.length - 1 - i] = next;
    }
    return parseInt(numStr.join(""), 10);
  }

}


async function partTwo() {
  const input = "307237-769058";

  const range = input.split("-").map(v => parseInt(v, 10));

  const start = parseInt(
    range[0]
      .toString()
      .split("")
      .map(v => input[0])
      .join(""),
    10
  );

  const reg = new RegExp(
    `(${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => `${v}{2,10}`).join("|")})`,
    'g'
  );

  let num = start;
  let count = 0;
  while (num < range[1]) {
    const match = num.toString().match(reg);
    if (match) {
      if (match.some(v => v.length === 2)) {
        count++;
      }
    }
    num = addOne(num, 0);
  }
  console.log({ count });

  function addOne(num: number, pos: number): number {
    const numStr = num.toString().split("");
    const val = parseInt(numStr[numStr.length - 1 - pos], 10);
    if (val === 9) {
      return addOne(num, pos + 1);
    }
    const next = (val + 1).toString();
    for (let i = 0; i <= pos; i++) {
      numStr[numStr.length - 1 - i] = next;
    }
    return parseInt(numStr.join(""), 10);
  }
}
