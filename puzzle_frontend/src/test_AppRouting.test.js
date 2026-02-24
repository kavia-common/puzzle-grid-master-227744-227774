import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

jest.mock("./api/apiClient", () => ({
  getLevels: jest.fn().mockResolvedValue({ source: "local", levels: [] }),
  getLevelById: jest.fn().mockResolvedValue({
    source: "local",
    level: {
      id: "l1",
      title: "Mock Level",
      size: 1,
      maxValue: 1,
      grid: [[0]],
      fixed: [],
      solution: [[1]],
    },
  }),
  postProgress: jest.fn().mockResolvedValue({ ok: true }),
}));

describe("App routing", () => {
  test("renders level select route", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Puzzle Grid/i)).toBeInTheDocument();
    expect(await screen.findByText(/Choose a Level/i)).toBeInTheDocument();
  });

  test("renders game route", async () => {
    render(
      <MemoryRouter initialEntries={["/play/l1"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Level:\s*Mock Level/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Puzzle grid")).toBeInTheDocument();
  });
});
