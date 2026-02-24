/**
 * Puzzle rules (current MVP):
 * - Values are integers 1..maxValue
 * - 0 means empty
 * - No duplicates in any row or column (ignoring 0)
 */

// PUBLIC_INTERFACE
export function createInitialState(level) {
  /** Create a new game state from a level definition. */
  const { grid, fixed, solution, size, maxValue } = level;

  const fixedMap = new Set(fixed.map((c) => `${c.r},${c.c}`));
  const current = grid.map((row) => row.slice());

  return {
    levelId: level.id,
    title: level.title,
    size,
    maxValue,
    fixedMap,
    solution,
    current,
    selected: { r: 0, c: 0 },
    moves: 0,
    startedAt: Date.now(),
    elapsedMs: 0,
    status: "ready", // ready | playing | solved
    notes: {}, // "r,c" -> string (optional pencil notes)
    errors: new Set(), // set of "r,c" currently in conflict
  };
}

export function inRange(v, maxValue) {
  return Number.isInteger(v) && v >= 1 && v <= maxValue;
}

function keyOf(r, c) {
  return `${r},${c}`;
}

function computeConflicts(grid, maxValue) {
  const errors = new Set();
  const size = grid.length;

  // Row conflicts
  for (let r = 0; r < size; r += 1) {
    const seen = new Map(); // value -> col
    for (let c = 0; c < size; c += 1) {
      const v = grid[r][c];
      if (!inRange(v, maxValue)) continue;
      if (seen.has(v)) {
        errors.add(keyOf(r, c));
        errors.add(keyOf(r, seen.get(v)));
      } else {
        seen.set(v, c);
      }
    }
  }

  // Col conflicts
  for (let c = 0; c < size; c += 1) {
    const seen = new Map(); // value -> row
    for (let r = 0; r < size; r += 1) {
      const v = grid[r][c];
      if (!inRange(v, maxValue)) continue;
      if (seen.has(v)) {
        errors.add(keyOf(r, c));
        errors.add(keyOf(seen.get(v), c));
      } else {
        seen.set(v, r);
      }
    }
  }

  return errors;
}

// PUBLIC_INTERFACE
export function validateGrid(grid, maxValue) {
  /** Validate grid. Returns errors set and whether it's complete and consistent. */
  const errors = computeConflicts(grid, maxValue);

  let complete = true;
  for (let r = 0; r < grid.length; r += 1) {
    for (let c = 0; c < grid[r].length; c += 1) {
      const v = grid[r][c];
      if (v === 0) complete = false;
      if (v !== 0 && !inRange(v, maxValue)) {
        complete = false;
        errors.add(keyOf(r, c));
      }
    }
  }

  const consistent = errors.size === 0;
  return { errors, complete, consistent };
}

// PUBLIC_INTERFACE
export function isSolved(grid, solution) {
  /** Check solved status. Solution cells with 0 are treated as unknown (cannot confirm). */
  for (let r = 0; r < grid.length; r += 1) {
    for (let c = 0; c < grid[r].length; c += 1) {
      if (solution[r][c] === 0) return false;
      if (grid[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

// PUBLIC_INTERFACE
export function applyValue(state, r, c, value) {
  /** Apply a value into the grid (respecting fixed cells). Returns updated state. */
  const cellKey = keyOf(r, c);
  if (state.fixedMap.has(cellKey)) return state;

  const nextGrid = state.current.map((row) => row.slice());
  nextGrid[r][c] = value;

  const { errors, complete, consistent } = validateGrid(nextGrid, state.maxValue);
  const solved = complete && consistent && isSolved(nextGrid, state.solution);

  return {
    ...state,
    current: nextGrid,
    moves: state.moves + 1,
    status: solved ? "solved" : "playing",
    errors,
  };
}

// PUBLIC_INTERFACE
export function clearValue(state, r, c) {
  /** Clear a cell (set to 0). */
  return applyValue(state, r, c, 0);
}

// PUBLIC_INTERFACE
export function findHint(state) {
  /** Provide a hint: returns {r,c,value, reason} or null. */
  // Prefer a cell that is empty and has known solution value.
  for (let r = 0; r < state.size; r += 1) {
    for (let c = 0; c < state.size; c += 1) {
      if (state.current[r][c] !== 0) continue;
      const sol = state.solution[r][c];
      if (inRange(sol, state.maxValue)) {
        return { r, c, value: sol, reason: "From solution" };
      }
    }
  }
  return null;
}
