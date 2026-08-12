import { render } from "vitest-browser-react";
import { expect, test } from "vitest";
import { MemoryRouter } from "react-router-dom";

import Login from "./Login";
import { AuthProvider } from "../../context/AuthContext";

test("typing a username updates the input", async () => {
  const screen = await render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );

  const username = screen.getByLabelText("Username:");

  await username.fill("John Doe");

  await expect.element(username).toHaveValue("John Doe");
});