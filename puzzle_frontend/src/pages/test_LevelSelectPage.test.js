import React from "react";
import { render, screen } from "@testing-library/react";
import LevelSelectPage from "./LevelSelectPage";
import { MemoryRouter } from "react-router-dom";

jest.mock("../api/apiClient", () => ({
  getLevels: jest.fn(),
}));

jest.mock("../utils/storage", () => ({
  loadProgress: jest.fn(),
}));

const { getLevels } = require("../api/apiClient");
const { loadProgress } = require("../utils/storage");

function renderPage() {
  return render(
    <MemoryRouter>
      <LevelSelectPage />
    </MemoryRouter>
  );
}

describe("LevelSelectPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadProgress.mockReturnValue({ l1: { completed: true, bestSeconds: 42 } });
  });

  test("shows loading skeleton while fetching", async () => {
    getLevels.mockImplementation(
      () =>
        new Promise(() => {
          // never resolves for this test
        })
    );

    renderPage();

    expect(screen.getByText("Choose a Level")).toBeInTheDocument();
    expect(screen.getByText(/Loading levels…/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Level list")).toBeInTheDocument();
  });

  test("renders level cards after successful load", async () => {
    getLevels.mockResolvedValue({
      source: "local",
      levels: [
        { id: "l1", title: "Warm-up 4×4", size: 4, maxValue: 4, givens: 6, difficulty: "easy" },
        { id: "l2", title: "Classic 5×5", size: 5, maxValue: 5, givens: 5, difficulty: "medium" },
      ],
    });

    renderPage();

    expect(await screen.findByText(/Levels source: local/i)).toBeInTheDocument();
    expect(screen.getByText("Warm-up 4×4")).toBeInTheDocument();
    expect(screen.getByText("Classic 5×5")).toBeInTheDocument();

    // A "Play" link exists per card
    const playLinks = screen.getAllByRole("link", { name: /Play/i });
    expect(playLinks.length).toBe(2);
    expect(playLinks[0].getAttribute("href")).toMatch(/\/play\//);
  });

  test("shows error message when API fails", async () => {
    getLevels.mockRejectedValue(new Error("backend down"));

    renderPage();

    expect(await screen.findByText(/Error: backend down/i)).toBeInTheDocument();
  });
});
