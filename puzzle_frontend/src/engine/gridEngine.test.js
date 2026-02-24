import { applyValue, createInitialState, validateGrid } from "./gridEngine";

test("validateGrid detects row conflicts", () => {
  const grid = [
    [1, 1],
    [0, 2],
  ];
  const { errors, consistent } = validateGrid(grid, 2);
  expect(consistent).toBe(false);
  expect(errors.size).toBeGreaterThan(0);
});

test("applyValue increments moves and sets status", () => {
  const level = {
    id: "t",
    title: "Test",
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
  const s1 = applyValue(s0, 0, 1, 2);
  expect(s1.moves).toBe(1);
  expect(s1.current[0][1]).toBe(2);
});
