import React from "react";
import { Link, useLocation } from "react-router-dom";

// PUBLIC_INTERFACE
export default function HeaderLinks() {
  /** Header links; uses SPA navigation and keeps current location for future enhancements. */
  const _loc = useLocation();

  return (
    <div className="headerActions" aria-label="Header actions">
      <Link className="btn btnGhost" to="/" aria-label="Go to level selection">
        Levels
      </Link>
      <a
        className="btn btnGhost"
        href="https://"
        onClick={(e) => e.preventDefault()}
        aria-label="How to play (see side panel in game)"
      >
        How to play
      </a>
    </div>
  );
}
