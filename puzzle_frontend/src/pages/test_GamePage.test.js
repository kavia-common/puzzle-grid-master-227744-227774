import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GamePage from "./GamePage";

jest.mock("../api/apiClient", () => ({
  getLevelById: jest.fn(),
  postProgress: jest.fn(),
}));

jest.mock("../utils/storage", () => ({
  loadProgress: jest.fn(),
  saveProgress: jest.fn(),
  loadSettings: jest.fn(),
  saveSettings: jest.fn(),
}));

const { getLevelById, postProgress } = require("../api/apiClient");
const { loadProgress, saveProgress, loadSettings, saveSettings } = require("../utils/storage");

function renderAtLevel(levelId = "l1") {
  return render(
    <MemoryRouter initialEntries={[`/play/${levelId}`]}>
      <Routes>
        <Route path="/play/:levelId" element={<GamePage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("GamePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadProgress.mockReturnValue({});
    loadSettings.mockReturnValue({ timerEnabled: true });
    postProgress.mockResolvedValue({ ok: true });
  });

  test("shows loading state while level is fetching", async () => {
    getLevelById.mockImplementation(
      () =>
        new Promise(() => {
          // keep pending
        })
    );

    renderAtLevel("l1");
    expect(screen.getByText(/Loading level…/i)).toBeInTheDocument();
  });

  test("shows error UI when level fails to load", async () => {
    getLevelById.mockRejectedValue(new Error("nope"));

    renderAtLevel("l1");

    expect(await screen.findByText(/Unable to load level: nope/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to levels/i })).toHaveAttribute("href", "/");
  });

  test("renders game UI after load and allows hint/undo/redo interaction", async () => {
    const level = {
      id: "l1",
      title: "Warm-up 4×4",
      size: 2,
      maxValue: 2,
      grid: [
        [1, 0],
        [0, 2],
      ],
      fixed: [
        { r: 0, c: 0 },
        { r: 1, c: 1 },
      ],
      solution: [
        [1, 2],
        [2, 1],
      ],
      par: { moves: 10, seconds: 120 },
    };

    getLevelById.mockResolvedValue({ level, source: "local" });

    renderAtLevel("l1");

    expect(await screen.findByText(/Level:\s*Warm-up 4×4/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Puzzle grid")).toBeInTheDocument();

    // Undo/Redo disabled initially
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();

    // Hint should fill something and enable Undo
    await act(async () => {
      screen.getByRole("button", { name: "Hint" }).click();
    });

    expect(screen.getByRole("button", { name: "Undo" })).not.toBeDisabled();

    // Undo then Redo should become enabled
    await act(async () => {
      screen.getByRole("button", { name: "Undo" }).click();
    });
    expect(screen.getByRole("button", { name: "Redo" })).not.toBeDisabled();
  });

  test("toggling timer calls saveSettings with updated value", async () => {
    const level = {
      id: "l1",
      title: "Warm-up 4×4",
      size: 2,
      maxValue: 2,
      grid: [
        [1, 0],
        [0, 2],
      ],
      fixed: [
        { r: 0, c: 0 },
        { r: 1, c: 1 },
      ],
      solution: [
        [1, 2],
        [2, 1],
      ],
    };

    getLevelById.mockResolvedValue({ level, source: "local" });
    loadSettings.mockReturnValue({ timerEnabled: true });

    renderAtLevel("l1");

    await screen.findByText(/Level:\s*Warm-up 4×4/i);

    const timerCheckbox = screen.getByRole("checkbox");
    expect(timerCheckbox).toBeChecked();

    const user = userEvent.setup();
    await user.click(timerCheckbox);

    // saveSettings runs via effect; we just assert it was called with timerEnabled false at least once.
    expect(saveSettings).toHaveBeenCalled();
    const lastCallArg = saveSettings.mock.calls[saveSettings.mock.calls.length - 1][0];
    expect(lastCallArg.timerEnabled).toBe(false);
  });

  test("when solved, saves progress and posts progress", async () => {
    // A tiny 1x1 level that becomes solved after one move
    const level = {
      id: "l-solve",
      title: "Solve 1×1",
      size: 1,
      maxValue: 1,
      grid: [[0]],
      fixed: [],
      solution: [[1]],
    };

    getLevelById.mockResolvedValue({ level, source: "local" });
    loadProgress.mockReturnValue({});

    renderAtLevel("l-solve");
    await screen.findByText(/Level:\s*Solve 1×1/i);

    // click keypad "1"
    await act(async () => {
      screen.getByRole("button", { name: "1" }).click();
    });

    // Solved banner appears and progress saved
    expect(await screen.findByText(/Solved! Progress saved locally./i)).toBeInTheDocument();
    expect(saveProgress).toHaveBeenCalled();
    expect(postProgress).toHaveBeenCalled();
  });
});
