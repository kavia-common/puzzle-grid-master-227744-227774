import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import HeaderLinks from "./components/HeaderLinks";
import GamePage from "./pages/GamePage";
import LevelSelectPage from "./pages/LevelSelectPage";

// PUBLIC_INTERFACE
function App() {
  /** Full puzzle app shell (step 02.00):
   * - Routes: Level select + game view
   * - Gameplay: grid engine + timer/scoring + hints + undo/redo
   * - Persistence: progress + settings in localStorage
   * - API client: uses REACT_APP_API_BASE / REACT_APP_BACKEND_URL with offline fallback
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

            <HeaderLinks />
          </div>
        </header>

        <main className="appMain" aria-label="Main content">
          <Routes>
            <Route path="/" element={<LevelSelectPage />} />
            <Route path="/play/:levelId" element={<GamePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="appFooter" aria-label="Footer">
          <div className="footerInner">
            <div className="footerCard footerMini">
              <div className="footerMiniRow">
                <span className="mutedText">
                  Tip: Use keyboard arrows + numbers for fast play. Progress is saved locally.
                </span>
                <span className="tinyMeta">v0.2</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
