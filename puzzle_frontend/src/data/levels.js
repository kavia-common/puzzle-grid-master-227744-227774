/**
 * Level format:
 * - grid is rows of digits (0..maxValue) separated by spaces, or a 2D array of numbers.
 * - fixed: coordinates that are pre-filled and immutable.
 * - solution: full solved grid (used for validation + hints). In a real backend, solution might be omitted;
 *   here we keep it for a self-contained frontend demo.
 */

/**
 * @typedef {{ r: number, c: number }} CellCoord
 * @typedef {{ id: string, title: string, size: number, maxValue: number, givens: number, difficulty: 'easy'|'medium'|'hard' }} LevelSummary
 * @typedef {{
 *  id: string,
 *  title: string,
 *  description?: string,
 *  size: number,
 *  maxValue: number,
 *  grid: number[][],
 *  fixed: CellCoord[],
 *  solution: number[][],
 *  par?: { moves?: number, seconds?: number },
 * }} LevelDefinition
 */

function parseGrid(grid, size) {
  if (Array.isArray(grid) && Array.isArray(grid[0])) return grid;
  if (typeof grid !== "string") throw new Error("Invalid grid format");
  const rows = grid
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length !== size) throw new Error("Grid row count mismatch");
  return rows.map((row) => {
    const parts = row.split(/\s+/);
    if (parts.length !== size) throw new Error("Grid col count mismatch");
    return parts.map((p) => Number(p));
  });
}

function coordsFromGrid(grid) {
  const fixed = [];
  for (let r = 0; r < grid.length; r += 1) {
    for (let c = 0; c < grid[r].length; c += 1) {
      if (grid[r][c] !== 0) fixed.push({ r, c });
    }
  }
  return fixed;
}

// Simple Latin-square style puzzle (size 4, values 1..4)
const LEVELS_RAW = [
  {
    id: "l1",
    title: "Warm-up 4×4",
    description: "Fill each row/col with 1..4 (no repeats).",
    size: 4,
    maxValue: 4,
    grid: `
      1 0 0 4
      0 4 1 0
      0 1 0 3
      4 0 2 0
    `,
    solution: `
      1 2 3 4
      3 4 1 2
      2 1 4 3
      4 3 2 1
    `,
    par: { moves: 20, seconds: 120 },
  },
  {
    id: "l2",
    title: "Classic 5×5",
    description: "Same rule: 1..5 in each row/col.",
    size: 5,
    maxValue: 5,
    grid: `
      1 0 0 0 5
      0 5 0 2 0
      0 0 3 0 0
      0 2 0 4 0
      5 0 0 0 1
    `,
    solution: `
      1 3 4 0 5
      4 5 1 2 3
      2 4 3 1 0
      3 2 5 4 0
      5 0 2 3 1
    `,
  },
];

// NOTE: For l2, solution includes some 0s to demonstrate “incomplete solution” case in offline mode.
// The validator will treat 0s as unknown, so completion requires filling all cells and being consistent.

const LEVELS = LEVELS_RAW.map((lvl) => {
  const grid = parseGrid(lvl.grid, lvl.size);
  const sol = parseGrid(lvl.solution, lvl.size);
  const fixed = coordsFromGrid(grid);

  return {
    id: lvl.id,
    title: lvl.title,
    description: lvl.description,
    size: lvl.size,
    maxValue: lvl.maxValue,
    grid,
    fixed,
    solution: sol,
    par: lvl.par,
  };
});

// PUBLIC_INTERFACE
export function listLevelSummaries() {
  /** Return level summaries for the level select screen. */
  return LEVELS.map((l) => ({
    id: l.id,
    title: l.title,
    size: l.size,
    maxValue: l.maxValue,
    givens: l.fixed.length,
    difficulty: l.size <= 4 ? "easy" : "medium",
  }));
}

// PUBLIC_INTERFACE
export function getLocalLevelById(levelId) {
  /** Return a local (bundled) level by id. */
  const level = LEVELS.find((l) => l.id === levelId);
  if (!level) {
    // default to first
    return LEVELS[0];
  }
  return level;
}
