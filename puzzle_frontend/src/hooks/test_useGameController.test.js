import React from "react";
import { render, screen, act } from "@testing-library/react";
import { useGameController } from "./useGameController";

function ControllerHarness({ level, timerEnabled }) {
  const controller = useGameController(level, { timerEnabled });
  const { present, canUndo, canRedo, usedHints, lastHint, elapsedLabel, actions } = controller;

  return (
    <div>
      <div data-testid="moves">{present.moves}</div>
      <div data-testid="status">{present.status}</div>
      <div data-testid="selected">
        {present.selected.r},{present.selected.c}
      </div>
      <div data-testid="cell00">{present.current[0][0]}</div>
      <div data-testid="cell01">{present.current[0][1]}</div>
      <div data-testid="canUndo">{String(canUndo)}</div>
      <div data-testid="canRedo">{String(canRedo)}</div>
      <div data-testid="usedHints">{usedHints}</div>
      <div data-testid="hintMsg">{lastHint?.message || ""}</div>
      <div data-testid="elapsedLabel">{elapsedLabel}</div>

      <button type="button" onClick={() => actions.selectCell(0, 1)}>
        select01
      </button>
      <button type="button" onClick={() => actions.setValue(0, 1, 2)}>
        set01to2
      </button>
      <button type="button" onClick={() => actions.clear(0, 1)}>
        clear01
      </button>
      <button type="button" onClick={() => actions.undo()}>
        undo
      </button>
      <button type="button" onClick={() => actions.redo()}>
        redo
      </button>
      <button type="button" onClick={() => actions.hint()}>
        hint
      </button>
    </div>
  );
}

describe("useGameController (undo/redo/hints/timer)", () => {
  const level = {
    id: "hook-test",
    title: "Hook Test",
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

  test("setValue pushes history enabling undo; undo/redo restores grid values", async () => {
    render(<ControllerHarness level={level} timerEnabled={false} />);

    expect(screen.getByTestId("cell01").textContent).toBe("0");
    expect(screen.getByTestId("canUndo").textContent).toBe("false");
    expect(screen.getByTestId("canRedo").textContent).toBe("false");

    await act(async () => {
      screen.getByText("set01to2").click();
    });

    expect(screen.getByTestId("cell01").textContent).toBe("2");
    expect(screen.getByTestId("moves").textContent).toBe("1");
    expect(screen.getByTestId("canUndo").textContent).toBe("true");
    expect(screen.getByTestId("canRedo").textContent).toBe("false");

    await act(async () => {
      screen.getByText("undo").click();
    });

    expect(screen.getByTestId("cell01").textContent).toBe("0");
    expect(screen.getByTestId("moves").textContent).toBe("0");
    expect(screen.getByTestId("canUndo").textContent).toBe("false");
    expect(screen.getByTestId("canRedo").textContent).toBe("true");

    await act(async () => {
      screen.getByText("redo").click();
    });

    expect(screen.getByTestId("cell01").textContent).toBe("2");
    expect(screen.getByTestId("moves").textContent).toBe("1");
    expect(screen.getByTestId("canUndo").textContent).toBe("true");
    expect(screen.getByTestId("canRedo").textContent).toBe("false");
  });

  test("new move clears the redo future", async () => {
    render(<ControllerHarness level={level} timerEnabled={false} />);

    await act(async () => {
      screen.getByText("set01to2").click();
    });
    await act(async () => {
      screen.getByText("undo").click();
    });
    expect(screen.getByTestId("canRedo").textContent).toBe("true");

    // make a different move (clear is still a move, but cell is already 0; still increments moves via applyValue)
    await act(async () => {
      screen.getByText("clear01").click();
    });

    expect(screen.getByTestId("canRedo").textContent).toBe("false");
  });

  test("hint fills a cell and increments usedHints with message", async () => {
    render(<ControllerHarness level={level} timerEnabled={false} />);

    await act(async () => {
      screen.getByText("hint").click();
    });

    expect(Number(screen.getByTestId("usedHints").textContent)).toBe(1);
    expect(screen.getByTestId("hintMsg").textContent).toMatch(/Hint filled R\d+C\d+ = \d/);
  });

  test("timer tick does not advance elapsed time when timerEnabled=false", async () => {
    jest.useFakeTimers();

    render(<ControllerHarness level={level} timerEnabled={false} />);

    const initialLabel = screen.getByTestId("elapsedLabel").textContent;

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    const afterLabel = screen.getByTestId("elapsedLabel").textContent;
    expect(afterLabel).toBe(initialLabel);

    jest.useRealTimers();
  });

  test("timer tick advances elapsed time when timerEnabled=true", async () => {
    jest.useFakeTimers();

    render(<ControllerHarness level={level} timerEnabled={true} />);

    const initialLabel = screen.getByTestId("elapsedLabel").textContent;

    await act(async () => {
      jest.advanceTimersByTime(1200);
    });

    const afterLabel = screen.getByTestId("elapsedLabel").textContent;
    // label should change from 00:00 to 00:01 or more
    expect(afterLabel).not.toBe(initialLabel);

    jest.useRealTimers();
  });
});
