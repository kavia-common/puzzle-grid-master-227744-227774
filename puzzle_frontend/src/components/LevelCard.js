import React from "react";
import { Link } from "react-router-dom";

function fmtTime(bestSeconds) {
  if (!Number.isFinite(bestSeconds)) return "—";
  const m = Math.floor(bestSeconds / 60);
  const s = bestSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// PUBLIC_INTERFACE
export default function LevelCard({ level, progress }) {
  /** Display a level summary + progress. */
  const p = (progress && progress[level.id]) || {};
  const completed = p.completed === true;

  return (
    <div className="levelCard">
      <div className="levelCardHeader">
        <h3 className="levelTitle">{level.title}</h3>
        <span className={completed ? "pill pillDone" : "pill"}>{completed ? "Done" : "New"}</span>
      </div>

      <div className="levelMeta">
        <span className="metaItem">
          <span className="metaLabel">Size</span>
          <span className="metaValue">
            {level.size}×{level.size}
          </span>
        </span>
        <span className="metaItem">
          <span className="metaLabel">Givens</span>
          <span className="metaValue">{level.givens}</span>
        </span>
        <span className="metaItem">
          <span className="metaLabel">Best</span>
          <span className="metaValue">{fmtTime(p.bestSeconds)}</span>
        </span>
      </div>

      <div className="levelActions">
        <Link className="btn btnPrimary" to={`/play/${encodeURIComponent(level.id)}`}>
          Play
        </Link>
      </div>
    </div>
  );
}
