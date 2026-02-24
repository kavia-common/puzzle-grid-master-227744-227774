import {
  applyValue,
  createInitialState,
  findHint,
  isSolved,
  validateGrid,
} from "./gridEngine";

describe("gridEngine core logic", () => {
  test("applyValue does not modify fixed cells (returns same state reference)", () => {
    const level = {
      id: "fixed-test",
      title: "Fixed Test",
      size: 2,
      maxValue: 2,
      grid: [
        [1, 0],
        [0, 2],
      ],
      fixed: [
        { r: 0, c: 0 },
        { r: 1, c: 1 },
      ],
      solution: [
        [1, 2],
        [2, 1],
      ],
    };

    const s0 = createInitialState(level);
    const s1 = applyValue(s0, 0, 0, 2); // attempt to change fixed (0,0)

    expect(s1).toBe(s0);
    expect(s1.current[0][0]).toBe(1);
    expect(s1.moves).toBe(0);
  });

  test("validateGrid detects column conflicts and flags both conflicting cells", () => {
    const grid = [
      [1, 0],
      [1, 2],
    ];
    const { consistent, errors } = validateGrid(grid, 2);

    expect(consistent).toBe(false);
    expect(errors.has("0,0")).toBe(true);
    expect(errors.has("1,0")).toBe(true);
  });

  test("isSolved treats solution cells with 0 as unknown and returns false", () => {
    const grid = [
      [1, 2],
      [2, 1],
    ];
    const solutionUnknown = [
      [1, 0],
      [2, 1],
    ];

    expect(isSolved(grid, solutionUnknown)).toBe(false);
  });

  test("applyValue sets status to solved when grid is complete, consistent, and matches solution", () => {
    const level = {
      id: "solve-test",
      title: "Solve Test",
      size: 2,
      maxValue: 2,
      grid: [
        [1, 0],
        [0, 2],
      ],
      fixed: [
        { r: 0, c: 0 },
        { r: 1, c: 1 },
      ],
      // Must be consistent with givens: grid[1][1] is fixed=2, so solution[1][1] must be 2.
      solution: [
        [1, 2],
        [2, 1],
      ].map((row) => row.slice()),
    };

    // Adjust solution to match fixed givens for this minimal test level.
    level.solution[1][1] = 2;
    level.solution[1][0] = 1;

    const s0 = createInitialState(level);

    const s1 = applyValue(s0, 0, 1, 2);
    expect(s1.status).toBe("playing");

    // Fill the remaining cell with a non-conflicting value so the grid becomes complete and consistent.
    const s2 = applyValue(s1, 1, 0, 1);
    expect(s2.errors.size).toBe(0);
    expect(s2.status).toBe("solved");
  });

  test("findHint returns first empty cell with known solution value", () => {
    const level = {
      id: "hint-test",
      title: "Hint Test",
      size: 2,
      maxValue: 2,
      grid: [
        [0, 0],
        [0, 0],
      ],
      fixed: [],
      solution: [
        [2, 1],
        [1, 2],
      ],
    };

    const s0 = createInitialState(level);
    const hint = findHint(s0);

    expect(hint).toEqual({ r: 0, c: 0, value: 2, reason: "From solution" });
  });

  test("findHint returns null when no empty cell has a known (in-range) solution value", () => {
    const level = {
      id: "nohint-test",
      title: "No Hint Test",
      size: 2,
      maxValue: 2,
      grid: [
        [0, 0],
        [0, 0],
      ],
      fixed: [],
      solution: [
        [0, 0],
        [0, 0],
      ],
    };

    const s0 = createInitialState(level);
    const hint = findHint(s0);

    expect(hint).toBeNull();
  });
});
