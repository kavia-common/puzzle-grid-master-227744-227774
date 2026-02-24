import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

test("renders app title and level select", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/Puzzle Grid/i)).toBeInTheDocument();
  expect(screen.getByText(/Choose a Level/i)).toBeInTheDocument();
});
