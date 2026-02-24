import React, { useEffect, useMemo, useRef } from "react";

function cellKey(r, c) {
  return `${r},${c}`;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Normalize a possibly-missing/partial grid to a safe 2D array.
 * Returns `null` when a usable grid cannot be derived.
 */
function coerceGrid(current, size) {
  if (!Number.isFinite(size) || size <= 0) return null;
  if (!Array.isArray(current)) return null;

  // Accept partial/malformed payloads, but only use rows that are arrays.
  const rows = current
    .slice(0, size)
    .map((row) => (Array.isArray(row) ? row.slice(0, size) : null));

  // If any row is missing, consider the grid partial/unusable for rendering.
  if (rows.some((r) => !r)) return null;
  return /** @type {number[][]} */ (rows);
}

// PUBLIC_INTERFACE
export default function PuzzleGrid({ state, onSelect, onSetValue, onClear }) {
  /** Accessible grid: arrow keys move selection, digits set values, backspace clears.
   * Defensive rendering: the UI must not crash if `state` contains missing/partial grid data.
   */
  const safeSize = Number.isFinite(state?.size) ? state.size : 0;
  const safeMaxValue = Number.isFinite(state?.maxValue) ? state.maxValue : 1;

  const grid = useMemo(() => coerceGrid(state?.current, safeSize), [state?.current, safeSize]);
  const hasUsableGrid = safeSize > 0 && grid !== null;

  const safeFixedMap = state?.fixedMap instanceof Set ? state.fixedMap : new Set();
  const safeErrors = state?.errors instanceof Set ? state.errors : null;

  const safeSelectedRaw =
    state?.selected && Number.isFinite(state.selected.r) && Number.isFinite(state.selected.c)
      ? state.selected
      : { r: 0, c: 0 };

  const safeSelected = {
    r: hasUsableGrid ? clamp(safeSelectedRaw.r, 0, safeSize - 1) : 0,
    c: hasUsableGrid ? clamp(safeSelectedRaw.c, 0, safeSize - 1) : 0,
  };

  const gridRef = useRef(null);
  const describedById = useMemo(() => "gridHelp", []);

  useEffect(() => {
    // Keep focus on grid for keyboard play.
    if (gridRef.current) gridRef.current.focus();
  }, [state?.levelId]);

  function moveSelection(dr, dc) {
    if (!hasUsableGrid) return;
    const r = clamp(safeSelected.r + dr, 0, safeSize - 1);
    const c = clamp(safeSelected.c + dc, 0, safeSize - 1);
    onSelect(r, c);
  }

  function handleKeyDown(e) {
    if (!hasUsableGrid) return;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveSelection(-1, 0);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveSelection(1, 0);
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveSelection(0, -1);
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      moveSelection(0, 1);
      return;
    }

    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      onClear(safeSelected.r, safeSelected.c);
      return;
    }

    // number keys 1..maxValue
    if (/^\d$/.test(e.key)) {
      const v = Number(e.key);
      if (v >= 1 && v <= safeMaxValue) {
        e.preventDefault();
        onSetValue(safeSelected.r, safeSelected.c, v);
      }
    }
  }

  if (!hasUsableGrid) {
    // Render a stable, non-crashing placeholder when grid data is missing/partial.
    return (
      <div className="gridWrap">
        <div className="puzzleStage" role="status" aria-live="polite">
          Preparing grid…
        </div>
      </div>
    );
  }

  return (
    <div className="gridWrap">
      <p id={describedById} className="srOnly">
        Use arrow keys to move. Press numbers 1 to {safeMaxValue} to fill. Backspace to clear.
      </p>

      <div
        ref={gridRef}
        className="puzzleGrid"
        role="grid"
        tabIndex={0}
        aria-label="Puzzle grid"
        aria-describedby={describedById}
        aria-rowcount={safeSize}
        aria-colcount={safeSize}
        onKeyDown={handleKeyDown}
      >
        {Array.from({ length: safeSize }).map((_, r) => (
          <div key={`row-${r}`} role="row" className="gridRow">
            {Array.from({ length: safeSize }).map((__, c) => {
              const k = cellKey(r, c);
              const isFixed = safeFixedMap.has(k);
              const isSelected = safeSelected.r === r && safeSelected.c === c;
              const hasError = safeErrors ? safeErrors.has(k) : false;

              // Safe access (even though `grid` is validated), to ensure no runtime crash.
              const value = grid?.[r]?.[c] ?? 0;

              const className = [
                "gridCell",
                isFixed ? "gridCellFixed" : "",
                isSelected ? "gridCellSelected" : "",
                hasError ? "gridCellError" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={k}
                  type="button"
                  role="gridcell"
                  className={className}
                  aria-selected={isSelected}
                  aria-label={`Row ${r + 1} Column ${c + 1} ${isFixed ? "fixed" : "editable"} ${
                    value ? `value ${value}` : "empty"
                  }`}
                  onClick={() => onSelect(r, c)}
                >
                  <span className="gridCellValue">{value === 0 ? "" : value}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
