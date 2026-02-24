import React, { useEffect, useMemo, useState } from "react";
import LevelCard from "../components/LevelCard";
import { getLevels } from "../api/apiClient";
import { loadProgress } from "../utils/storage";

// PUBLIC_INTERFACE
export default function LevelSelectPage() {
  /** Level selection page; shows remote/local source state and progress. */
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState([]);
  const [source, setSource] = useState("local");
  const [error, setError] = useState(null);

  const progress = useMemo(() => loadProgress(), []);

  useEffect(() => {
    let alive = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await getLevels();
        if (!alive) return;
        setLevels(res.levels || []);
        setSource(res.source || "local");
      } catch (e) {
        if (!alive) return;
        setError(String(e && e.message ? e.message : e));
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="page">
      <div className="pageHeader">
        <h2 className="pageTitle">Choose a Level</h2>
        <div className="pageHeaderMeta" role="status" aria-live="polite">
          {loading ? "Loading levels…" : `Levels source: ${source}`}
        </div>
      </div>

      {error ? <p className="errorText">Error: {error}</p> : null}

      <div className="levelGrid" aria-label="Level list">
        {loading ? (
          <div className="skeletonGrid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`sk-${i}`} className="skeletonCard" />
            ))}
          </div>
        ) : (
          levels.map((lvl) => <LevelCard key={lvl.id} level={lvl} progress={progress} />)
        )}
      </div>
    </div>
  );
}
