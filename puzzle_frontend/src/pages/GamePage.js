import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PuzzleGrid from "../components/PuzzleGrid";
import GameControls from "../components/GameControls";
import { getLevelById, postProgress } from "../api/apiClient";
import { loadProgress, loadSettings, saveProgress, saveSettings } from "../utils/storage";
import { useGameController } from "../hooks/useGameController";

// PUBLIC_INTERFACE
export default function GamePage() {
  /** Game screen: loads a level, runs game controller, and saves progress on solve. */
  const { levelId } = useParams();
  const [levelLoading, setLevelLoading] = useState(true);
  const [levelError, setLevelError] = useState(null);
  const [level, setLevel] = useState(null);
  const [source, setSource] = useState("local");

  const [settings, setSettings] = useState(() => loadSettings());

  useEffect(() => {
    let alive = true;
    async function run() {
      setLevelLoading(true);
      setLevelError(null);
      try {
        const res = await getLevelById(levelId);
        if (!alive) return;
        setLevel(res.level);
        setSource(res.source);
      } catch (e) {
        if (!alive) return;
        setLevelError(String(e && e.message ? e.message : e));
      } finally {
        if (alive) setLevelLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [levelId]);

  const controller = useGameController(level || { id: "loading", title: "", size: 4, maxValue: 4, grid: [[0]], fixed: [], solution: [[0]] }, {
    timerEnabled: settings.timerEnabled === true,
  });

  const { present, elapsedLabel, score, usedHints, lastHint, canUndo, canRedo, actions } = controller;

  // Save settings when changed
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const statusLabel = useMemo(() => {
    if (levelLoading) return "Loading";
    if (levelError) return "Error";
    if (present.status === "solved") return "Solved";
    if (present.errors && present.errors.size > 0) return "Conflicts";
    if (present.status === "ready") return "Ready";
    return "Playing";
  }, [levelLoading, levelError, present.status, present.errors]);

  // Persist progress on solve
  useEffect(() => {
    if (!level) return;
    if (present.status !== "solved") return;

    const progress = loadProgress();
    const prev = progress[level.id] || {};
    const bestSecondsPrev = prev.bestSeconds;

    const elapsedSeconds = Math.max(1, Math.floor(present.elapsedMs / 1000));
    const bestSeconds =
      typeof bestSecondsPrev === "number" ? Math.min(bestSecondsPrev, elapsedSeconds) : elapsedSeconds;

    const next = {
      ...progress,
      [level.id]: {
        completed: true,
        bestSeconds,
        lastScore: score,
        lastMoves: present.moves,
        lastHints: usedHints,
        updatedAt: Date.now(),
      },
    };

    saveProgress(next);
    postProgress({ levelId: level.id, ...next[level.id] });
  }, [level, present.status, present.elapsedMs, present.moves, score, usedHints]);

  if (levelLoading) {
    return (
      <div className="page">
        <p className="mutedText">Loading level…</p>
      </div>
    );
  }

  if (levelError || !level) {
    return (
      <div className="page">
        <p className="errorText">Unable to load level: {levelError || "Unknown error"}</p>
        <Link className="btn" to="/">
          Back to levels
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="gridHeaderRow">
        <div>
          <h2 className="sectionTitle">Grid</h2>
          <div className="mutedText">
            Level: <strong>{level.title}</strong> <span className="tinyMeta">(source: {source})</span>
          </div>
        </div>

        <div className="headerActions">
          <Link className="btn btnGhost" to="/">
            Levels
          </Link>
          <button className="btn" type="button" onClick={() => actions.revalidate()}>
            Check
          </button>
        </div>
      </div>

      <div className="mainLayout">
        <section className="gridCard" aria-label="Puzzle grid area">
          <div className="puzzleStageReal" aria-label="Puzzle play area">
            <PuzzleGrid
              state={present}
              onSelect={actions.selectCell}
              onSetValue={actions.setValue}
              onClear={actions.clear}
            />
          </div>

          <div className="keypad" aria-label="Number keypad">
            {Array.from({ length: level.maxValue }).map((_, i) => {
              const v = i + 1;
              return (
                <button
                  key={`kp-${v}`}
                  type="button"
                  className="btn keypadBtn"
                  onClick={() => actions.setValue(present.selected.r, present.selected.c, v)}
                >
                  {v}
                </button>
              );
            })}
            <button
              type="button"
              className="btn keypadBtn"
              onClick={() => actions.clear(present.selected.r, present.selected.c)}
            >
              Clear
            </button>
          </div>
        </section>

        <aside className="panelCard" aria-label="Side panel">
          <GameControls
            timerEnabled={settings.timerEnabled === true}
            onToggleTimer={(enabled) => setSettings((s) => ({ ...s, timerEnabled: enabled }))}
            onHint={actions.hint}
            onUndo={actions.undo}
            onRedo={actions.redo}
            canUndo={canUndo}
            canRedo={canRedo}
            lastHintMessage={lastHint && lastHint.message ? lastHint.message : null}
          />
        </aside>
      </div>

      <div className="footerCard footerInline" aria-label="Footer stats">
        <div className="statsRow" aria-label="Stats row">
          <div className="stat">
            <span className="statLabel">Time</span>
            <span className="statValue">{elapsedLabel}</span>
          </div>
          <div className="stat">
            <span className="statLabel">Score</span>
            <span className="statValue">{score}</span>
          </div>
          <div className="stat">
            <span className="statLabel">Moves</span>
            <span className="statValue">{present.moves}</span>
          </div>
          <div className="stat">
            <span className="statLabel">Status</span>
            <span className="statValue">{statusLabel}</span>
          </div>
        </div>

        {present.status === "solved" ? (
          <p className="successText" role="status" aria-live="polite">
            Solved! Progress saved locally.
          </p>
        ) : null}
      </div>
    </div>
  );
}
