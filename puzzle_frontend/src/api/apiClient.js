const DEFAULT_TIMEOUT_MS = 7000;

function resolveApiBase() {
  const base =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "";

  return String(base || "").replace(/\/+$/, "");
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options && options.headers ? options.headers : {}),
      },
    });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

// PUBLIC_INTERFACE
export async function getLevels() {
  /** Fetch levels list from backend.
   * Falls back to local bundled levels if backend is unavailable.
   * @returns {Promise<{levels: import('../data/levels').LevelSummary[]; source: 'remote'|'local'}>}
   */
  const apiBase = resolveApiBase();
  if (!apiBase) {
    // No backend configured -> local
    const { listLevelSummaries } = await import("../data/levels");
    return { levels: listLevelSummaries(), source: "local" };
  }

  try {
    const res = await fetchWithTimeout(`${apiBase}/levels`, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Expect either {levels:[...]} or array. Normalize.
    const levels = Array.isArray(data) ? data : data.levels;
    if (!Array.isArray(levels)) throw new Error("Invalid levels payload");

    return { levels, source: "remote" };
  } catch (_e) {
    const { listLevelSummaries } = await import("../data/levels");
    return { levels: listLevelSummaries(), source: "local" };
  }
}

// PUBLIC_INTERFACE
export async function getLevelById(levelId) {
  /** Fetch a level definition.
   * Falls back to local bundled level if backend is unavailable.
   * @param {string} levelId
   * @returns {Promise<{level: import('../data/levels').LevelDefinition; source: 'remote'|'local'}>}
   */
  const apiBase = resolveApiBase();
  if (!apiBase) {
    const { getLocalLevelById } = await import("../data/levels");
    return { level: getLocalLevelById(levelId), source: "local" };
  }

  try {
    const res = await fetchWithTimeout(`${apiBase}/levels/${encodeURIComponent(levelId)}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const level = await res.json();
    if (!level || typeof level !== "object") throw new Error("Invalid level payload");
    return { level, source: "remote" };
  } catch (_e) {
    const { getLocalLevelById } = await import("../data/levels");
    return { level: getLocalLevelById(levelId), source: "local" };
  }
}

// PUBLIC_INTERFACE
export async function postProgress(_payload) {
  /** Optional: post progress to backend if available.
   * Safe no-op if backend unavailable.
   */
  const apiBase = resolveApiBase();
  if (!apiBase) return { ok: false, skipped: true };

  try {
    const res = await fetchWithTimeout(`${apiBase}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(_payload || {}),
    });
    return { ok: res.ok, status: res.status };
  } catch (_e) {
    return { ok: false, skipped: true };
  }
}
