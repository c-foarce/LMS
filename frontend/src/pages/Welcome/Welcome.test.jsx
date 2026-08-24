import { render } from "vitest-browser-react";
import { expect, test } from "vitest";
import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";

import Welcome from "./Welcome";


test("renders the welcome page", async () => {
  const screen = await render(
    <MemoryRouter>
      <Welcome />
    </MemoryRouter>
  );

  await expect.element(
    screen.getByRole("heading", { name: "Welcome" })
  ).toBeInTheDocument();

  await expect.element(
    screen.getByText("Lesson Management System")
  ).toBeInTheDocument();

  await expect.element(
    screen.getByRole("button", { name: "Click to Log in" })
  ).toBeInTheDocument();
});


test("clicking the login button navigates to the login page", async () => {
  const screen = await render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route
          path="/login"
          element={<h1>Login Page</h1>}
        />
      </Routes>
    </MemoryRouter>
  );

  await screen.getByRole(
    "button",
    { name: "Click to Log in" }
  ).click();

  await expect.element(
    screen.getByRole("heading", { name: "Login Page" })
  ).toBeInTheDocument();
});