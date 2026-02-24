const KEY_PROGRESS = "puzzleGrid.progress.v1";
const KEY_SETTINGS = "puzzleGrid.settings.v1";

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch (_e) {
    return fallback;
  }
}

// PUBLIC_INTERFACE
export function loadSettings() {
  /** Load user settings from localStorage. */
  const raw = window.localStorage.getItem(KEY_SETTINGS);
  const settings = safeJsonParse(raw || "null", null);
  return {
    timerEnabled: true,
    ...(settings && typeof settings === "object" ? settings : {}),
  };
}

// PUBLIC_INTERFACE
export function saveSettings(settings) {
  /** Persist user settings to localStorage. */
  window.localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings || {}));
}

// PUBLIC_INTERFACE
export function loadProgress() {
  /** Load per-level progress (best times, completion, etc.) from localStorage. */
  const raw = window.localStorage.getItem(KEY_PROGRESS);
  const progress = safeJsonParse(raw || "null", null);
  return progress && typeof progress === "object" ? progress : {};
}

// PUBLIC_INTERFACE
export function saveProgress(progress) {
  /** Persist per-level progress to localStorage. */
  window.localStorage.setItem(KEY_PROGRESS, JSON.stringify(progress || {}));
}
