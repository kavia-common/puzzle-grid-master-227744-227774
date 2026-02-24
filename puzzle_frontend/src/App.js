import React from "react";
import "./App.css";

// PUBLIC_INTERFACE
function App() {
  /** Baseline UI scaffold only (step 01.00):
   * - Retro-lite theme
   * - Responsive layout: header + centered grid area + side panel + footer stats
   * Future steps will replace placeholders with the real puzzle grid, controls, and stats.
   */

  return (
    <div className="App">
      <div className="appShell">
        <header className="appHeader">
          <div className="headerInner">
            <div className="brandBlock">
              <h1 className="brandTitle">Puzzle Grid</h1>
              <span className="brandTag" aria-label="UI theme tag">
                retro-lite
              </span>
            </div>

            <div className="headerActions" aria-label="Header actions">
              <button className="btn btnGhost" type="button">
                Levels
              </button>
              <button className="btn btnGhost" type="button">
                How to play
              </button>
              <button className="btn btnPrimary" type="button">
                Start
              </button>
            </div>
          </div>
        </header>

        <main className="appMain" aria-label="Main content">
          <div className="mainLayout">
            <section className="gridCard" aria-label="Puzzle grid area">
              <div className="gridHeaderRow">
                <h2 className="sectionTitle">Grid</h2>
                <div className="mutedText" aria-label="Level indicator">
                  Level: <strong>1</strong>
                </div>
              </div>

              <div className="puzzleStage" role="img" aria-label="Puzzle grid placeholder">
                Puzzle grid placeholder
                <br />
                (centered, responsive)
              </div>
            </section>

            <aside className="panelCard" aria-label="Side panel">
              <div className="panelSection">
                <h2 className="sectionTitle">Controls</h2>
                <p className="mutedText">
                  This area is reserved for hints, undo/redo, timer toggle, and other controls.
                  On mobile it will collapse below the grid (or become a drawer in a later step).
                </p>

                <div className="headerActions" aria-label="Control buttons">
                  <button className="btn" type="button">
                    Hint
                  </button>
                  <button className="btn" type="button">
                    Undo
                  </button>
                  <button className="btn" type="button">
                    Redo
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </main>

        <footer className="appFooter" aria-label="Footer stats">
          <div className="footerInner">
            <div className="footerCard">
              <div className="statsRow" aria-label="Stats row">
                <div className="stat">
                  <span className="statLabel">Time</span>
                  <span className="statValue">00:00</span>
                </div>
                <div className="stat">
                  <span className="statLabel">Score</span>
                  <span className="statValue">0</span>
                </div>
                <div className="stat">
                  <span className="statLabel">Moves</span>
                  <span className="statValue">0</span>
                </div>
                <div className="stat">
                  <span className="statLabel">Status</span>
                  <span className="statValue">Ready</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
