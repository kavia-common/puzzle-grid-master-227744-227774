import { useEffect, useMemo, useReducer } from "react";
import { applyValue, clearValue, createInitialState, findHint, validateGrid } from "../engine/gridEngine";

function now() {
  return Date.now();
}

function formatMs(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

function computeScore({ elapsedMs, moves, usedHints }, par) {
  // Simple score: start at 10000, subtract time + moves + hints penalties.
  // Bound at minimum 0.
  const timePenalty = Math.floor(elapsedMs / 1000) * 4;
  const movePenalty = moves * 25;
  const hintPenalty = usedHints * 250;

  let score = 10000 - timePenalty - movePenalty - hintPenalty;

  // small par bonus if provided
  if (par && typeof par.seconds === "number" && elapsedMs / 1000 <= par.seconds) score += 400;
  if (par && typeof par.moves === "number" && moves <= par.moves) score += 400;

  return Math.max(0, score);
}

const initialHistory = (present) => ({
  past: [],
  present,
  future: [],
});

function reducer(state, action) {
  switch (action.type) {
    case "RESET": {
      return {
        history: initialHistory(action.payload.present),
        usedHints: 0,
        lastHint: null,
      };
    }
    case "SELECT": {
      return {
        ...state,
        history: {
          ...state.history,
          present: { ...state.history.present, selected: action.payload.selected },
        },
      };
    }
    case "TICK": {
      const present = state.history.present;
      if (present.status === "solved") return state;
      if (action.payload.timerEnabled !== true) return state;

      return {
        ...state,
        history: {
          ...state.history,
          present: {
            ...present,
            elapsedMs: (action.payload.nowMs || now()) - present.startedAt,
            status: present.status === "ready" ? "playing" : present.status,
          },
        },
      };
    }
    case "SET_VALUE": {
      const { r, c, value } = action.payload;
      const present = state.history.present;
      const nextPresent = applyValue(present, r, c, value);

      return {
        ...state,
        history: {
          past: [...state.history.past, present],
          present: nextPresent,
          future: [],
        },
      };
    }
    case "CLEAR": {
      const { r, c } = action.payload;
      const present = state.history.present;
      const nextPresent = clearValue(present, r, c);

      return {
        ...state,
        history: {
          past: [...state.history.past, present],
          present: nextPresent,
          future: [],
        },
      };
    }
    case "UNDO": {
      if (state.history.past.length === 0) return state;
      const past = state.history.past.slice();
      const previous = past.pop();
      return {
        ...state,
        history: {
          past,
          present: previous,
          future: [state.history.present, ...state.history.future],
        },
      };
    }
    case "REDO": {
      if (state.history.future.length === 0) return state;
      const [next, ...rest] = state.history.future;
      return {
        ...state,
        history: {
          past: [...state.history.past, state.history.present],
          present: next,
          future: rest,
        },
      };
    }
    case "HINT": {
      const present = state.history.present;
      const hint = findHint(present);
      if (!hint) {
        return { ...state, lastHint: { message: "No hint available." } };
      }
      const nextPresent = applyValue(present, hint.r, hint.c, hint.value);

      return {
        ...state,
        usedHints: state.usedHints + 1,
        lastHint: { message: `Hint filled R${hint.r + 1}C${hint.c + 1} = ${hint.value}` },
        history: {
          past: [...state.history.past, present],
          present: nextPresent,
          future: [],
        },
      };
    }
    case "REVALIDATE": {
      const present = state.history.present;
      const { errors } = validateGrid(present.current, present.maxValue);
      return {
        ...state,
        history: { ...state.history, present: { ...present, errors } },
      };
    }
    default:
      return state;
  }
}

// PUBLIC_INTERFACE
export function useGameController(level, { timerEnabled }) {
  /** Controls a single game session with undo/redo and timer ticking. */
  const initial = useMemo(() => createInitialState(level), [level]);
  const [state, dispatch] = useReducer(reducer, {
    history: initialHistory(initial),
    usedHints: 0,
    lastHint: null,
  });

  // Reset when level changes
  useEffect(() => {
    dispatch({ type: "RESET", payload: { present: createInitialState(level) } });
  }, [level]);

  // Timer tick (only when enabled)
  useEffect(() => {
    const id = window.setInterval(() => {
      dispatch({ type: "TICK", payload: { timerEnabled, nowMs: now() } });
    }, 250);
    return () => window.clearInterval(id);
  }, [timerEnabled]);

  const present = state.history.present;
  const elapsedLabel = formatMs(present.elapsedMs);
  const score = computeScore(
    { elapsedMs: present.elapsedMs, moves: present.moves, usedHints: state.usedHints },
    level.par
  );

  const canUndo = state.history.past.length > 0;
  const canRedo = state.history.future.length > 0;

  return {
    present,
    elapsedLabel,
    score,
    usedHints: state.usedHints,
    lastHint: state.lastHint,
    canUndo,
    canRedo,
    actions: {
      // PUBLIC_INTERFACE
      selectCell: (r, c) => dispatch({ type: "SELECT", payload: { selected: { r, c } } }),
      // PUBLIC_INTERFACE
      setValue: (r, c, value) => dispatch({ type: "SET_VALUE", payload: { r, c, value } }),
      // PUBLIC_INTERFACE
      clear: (r, c) => dispatch({ type: "CLEAR", payload: { r, c } }),
      // PUBLIC_INTERFACE
      undo: () => dispatch({ type: "UNDO" }),
      // PUBLIC_INTERFACE
      redo: () => dispatch({ type: "REDO" }),
      // PUBLIC_INTERFACE
      hint: () => dispatch({ type: "HINT" }),
      // PUBLIC_INTERFACE
      revalidate: () => dispatch({ type: "REVALIDATE" }),
    },
  };
}
