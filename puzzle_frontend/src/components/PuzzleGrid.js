import React, { useEffect, useMemo, useRef } from "react";

function cellKey(r, c) {
  return `${r},${c}`;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// PUBLIC_INTERFACE
export default function PuzzleGrid({ state, onSelect, onSetValue, onClear }) {
  /** Accessible grid: arrow keys move selection, digits set values, backspace clears. */
  const { size, current, fixedMap, selected, errors, maxValue } = state;
  const gridRef = useRef(null);

  const describedById = useMemo(() => "gridHelp", []);

  useEffect(() => {
    // Keep focus on grid for keyboard play.
    if (gridRef.current) gridRef.current.focus();
  }, [state.levelId]);

  function moveSelection(dr, dc) {
    const r = clamp(selected.r + dr, 0, size - 1);
    const c = clamp(selected.c + dc, 0, size - 1);
    onSelect(r, c);
  }

  function handleKeyDown(e) {
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
      onClear(selected.r, selected.c);
      return;
    }

    // number keys 1..maxValue
    if (/^\d$/.test(e.key)) {
      const v = Number(e.key);
      if (v >= 1 && v <= maxValue) {
        e.preventDefault();
        onSetValue(selected.r, selected.c, v);
      }
    }
  }

  return (
    <div className="gridWrap">
      <p id={describedById} className="srOnly">
        Use arrow keys to move. Press numbers 1 to {maxValue} to fill. Backspace to clear.
      </p>

      <div
        ref={gridRef}
        className="puzzleGrid"
        role="grid"
        tabIndex={0}
        aria-label="Puzzle grid"
        aria-describedby={describedById}
        aria-rowcount={size}
        aria-colcount={size}
        onKeyDown={handleKeyDown}
      >
        {Array.from({ length: size }).map((_, r) => (
          <div key={`row-${r}`} role="row" className="gridRow">
            {Array.from({ length: size }).map((__, c) => {
              const k = cellKey(r, c);
              const isFixed = fixedMap.has(k);
              const isSelected = selected.r === r && selected.c === c;
              const hasError = errors && errors.has(k);
              const value = current[r][c];

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
