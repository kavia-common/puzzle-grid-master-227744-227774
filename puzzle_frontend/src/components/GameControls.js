import React from "react";

// PUBLIC_INTERFACE
export default function GameControls({
  timerEnabled,
  onToggleTimer,
  onHint,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  lastHintMessage,
}) {
  /** Side panel controls; kept keyboard accessible and screen-reader friendly. */
  return (
    <div className="panelSection">
      <h2 className="sectionTitle">Controls</h2>

      <div className="controlRow">
        <label className="toggle">
          <input
            type="checkbox"
            checked={timerEnabled}
            onChange={(e) => onToggleTimer(e.target.checked)}
          />
          <span className="toggleLabel">Timer</span>
        </label>
      </div>

      <div className="controlButtons" aria-label="Control buttons">
        <button className="btn" type="button" onClick={onHint}>
          Hint
        </button>
        <button className="btn" type="button" onClick={onUndo} disabled={!canUndo}>
          Undo
        </button>
        <button className="btn" type="button" onClick={onRedo} disabled={!canRedo}>
          Redo
        </button>
      </div>

      <p className="mutedText" role="status" aria-live="polite">
        {lastHintMessage || "Tip: use arrow keys + number keys to play faster."}
      </p>

      <details className="helpDetails">
        <summary className="btn btnGhost">How to play</summary>
        <div className="helpBody">
          <p className="mutedText">
            Fill every row and column with unique numbers from 1..N. Fixed cells cannot be changed.
          </p>
          <ul className="helpList">
            <li>Keyboard: arrows to move, digits to fill, backspace to clear.</li>
            <li>Undo/Redo available for moves.</li>
            <li>Hint fills one cell (affects score).</li>
          </ul>
        </div>
      </details>
    </div>
  );
}
