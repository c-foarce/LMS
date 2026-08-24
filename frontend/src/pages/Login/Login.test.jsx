import { afterEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./Login";
import { AuthProvider } from "../../context/AuthContext";
import api from "../../services/api";

import {
  mockLoginResponse,
  mockStudent,
} from "../../test/mocks/auth";


afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});


test("renders the login form", async () => {
  const screen = await render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );

  await expect.element(
    screen.getByRole("heading", { name: "Login" })
  ).toBeInTheDocument();

  await expect.element(
    screen.getByLabelText("Username:")
  ).toBeInTheDocument();

  await expect.element(
    screen.getByLabelText("Password:")
  ).toBeInTheDocument();

  await expect.element(
    screen.getByRole("button", { name: "Login" })
  ).toBeInTheDocument();
});


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


test("typing a password updates the input", async () => {
  const screen = await render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );

  const password = screen.getByLabelText("Password:");

  await password.fill("password123");

  await expect.element(password).toHaveValue("password123");
});


test("successfully logs a user in", async () => {
  const postMock = vi
    .spyOn(api, "post")
    .mockResolvedValue({
      data: mockLoginResponse,
    });

  const getMock = vi
    .spyOn(api, "get")
    .mockResolvedValue({
      data: mockStudent,
    });

  const screen = await render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );

  await screen.getByLabelText("Username:").fill(
    "teststudent"
  );

  await screen.getByLabelText("Password:").fill(
    "password123"
  );

  await screen.getByRole(
    "button",
    { name: "Login" }
  ).click();

  await expect.element(
    screen.getByText("Successfully Logged in!")
  ).toBeInTheDocument();

  expect(postMock).toHaveBeenCalledWith(
    "accounts/login/",
    {
      username: "teststudent",
      password: "password123",
    }
  );

  expect(getMock).toHaveBeenCalledWith(
    "accounts/user-role/"
  );

  expect(localStorage.getItem("access"))
    .toBe("mock-access-token");

  expect(localStorage.getItem("refresh"))
    .toBe("mock-refresh-token");
});


test("displays an error when login fails", async () => {
  const postMock = vi
    .spyOn(api, "post")
    .mockRejectedValue(
      new Error("Invalid credentials")
    );

  const screen = await render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );

  await screen.getByLabelText("Username:").fill(
    "wronguser"
  );

  await screen.getByLabelText("Password:").fill(
    "wrongpassword"
  );

  await screen.getByRole(
    "button",
    { name: "Login" }
  ).click();

  await expect.element(
    screen.getByText("Login Failed.")
  ).toBeInTheDocument();

  expect(postMock).toHaveBeenCalledWith(
    "accounts/login/",
    {
      username: "wronguser",
      password: "wrongpassword",
    }
  );

  expect(localStorage.getItem("access"))
    .toBeNull();

  expect(localStorage.getItem("refresh"))
    .toBeNull();
});


test("navigates to the app after successful login", async () => {
  vi.spyOn(api, "post").mockResolvedValue({
    data: mockLoginResponse,
  });

  vi.spyOn(api, "get").mockResolvedValue({
    data: mockStudent,
  });

  vi.useFakeTimers();

  const screen = await render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route
          path="/login"
          element={
            <AuthProvider>
              <Login />
            </AuthProvider>
          }
        />

        <Route
          path="/app"
          element={<h1>Application</h1>}
        />
      </Routes>
    </MemoryRouter>
  );

  await screen.getByLabelText("Username:").fill(
    "teststudent"
  );

  await screen.getByLabelText("Password:").fill(
    "password123"
  );

  await screen.getByRole(
    "button",
    { name: "Login" }
  ).click();

  await expect.element(
    screen.getByText("Successfully Logged in!")
  ).toBeInTheDocument();

  vi.advanceTimersByTime(1000);

  await expect.element(
    screen.getByRole("heading", { name: "Application" })
  ).toBeInTheDocument();

  vi.useRealTimers();
});