import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router-dom";

import Dashboard from "./Dashboard";

import {
  mockStudent,
  mockTeacher,
  mockAdmin,
} from "../../test/mocks/auth";


const mockUseAuth = vi.fn();

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));


// Mock of the three role-specific dashboards.
// Dashboard.jsx is responsible for choosing which dashboard
// to render. They will have their own test files for their API calls and data display
vi.mock("../../components/Dashboards/StudentDashboard", () => ({
  default: () => <div>Student Dashboard Mock</div>,
}));

vi.mock("../../components/Dashboards/TeacherDashboard", () => ({
  default: () => <div>Teacher Dashboard Mock</div>,
}));

vi.mock("../../components/Dashboards/AdminDashboard", () => ({
  default: () => <div>Admin Dashboard Mock</div>,
}));


beforeEach(() => {
  mockUseAuth.mockReset();
});


test("displays loading while the user is unavailable", async () => {
  mockUseAuth.mockReturnValue({
    user: null,
  });

  const screen = await render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  await expect.element(
    screen.getByText("Loading...")
  ).toBeInTheDocument();
});


test("displays the authenticated user's dashboard heading", async () => {
  mockUseAuth.mockReturnValue({
    user: mockStudent,
  });

  const screen = await render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  await expect.element(
    screen.getByRole(
      "heading",
      { name: "teststudent's Dashboard" }
    )
  ).toBeInTheDocument();
});


test("renders the student dashboard for a student", async () => {
  mockUseAuth.mockReturnValue({
    user: mockStudent,
  });

  const screen = await render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  await expect.element(
    screen.getByText("Student Dashboard Mock")
  ).toBeInTheDocument();

  await expect.element(
    screen.getByText("Teacher Dashboard Mock")
  ).not.toBeInTheDocument();

  await expect.element(
    screen.getByText("Admin Dashboard Mock")
  ).not.toBeInTheDocument();
});


test("renders the teacher dashboard for a teacher", async () => {
  mockUseAuth.mockReturnValue({
    user: mockTeacher,
  });

  const screen = await render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  await expect.element(
    screen.getByText("Teacher Dashboard Mock")
  ).toBeInTheDocument();

  await expect.element(
    screen.getByText("Student Dashboard Mock")
  ).not.toBeInTheDocument();

  await expect.element(
    screen.getByText("Admin Dashboard Mock")
  ).not.toBeInTheDocument();
});


test("renders the admin dashboard for an admin", async () => {
  mockUseAuth.mockReturnValue({
    user: mockAdmin,
  });

  const screen = await render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  await expect.element(
    screen.getByText("Admin Dashboard Mock")
  ).toBeInTheDocument();

  await expect.element(
    screen.getByText("Student Dashboard Mock")
  ).not.toBeInTheDocument();

  await expect.element(
    screen.getByText("Teacher Dashboard Mock")
  ).not.toBeInTheDocument();
});


test("does not render a role-specific dashboard for an unknown role", async () => {
  mockUseAuth.mockReturnValue({
    user: {
      username: "unknownuser",
      role: "unknown",
    },
  });

  const screen = await render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  await expect.element(
    screen.getByRole(
      "heading",
      { name: "unknownuser's Dashboard" }
    )
  ).toBeInTheDocument();

  await expect.element(
    screen.getByText("Student Dashboard Mock")
  ).not.toBeInTheDocument();

  await expect.element(
    screen.getByText("Teacher Dashboard Mock")
  ).not.toBeInTheDocument();

  await expect.element(
    screen.getByText("Admin Dashboard Mock")
  ).not.toBeInTheDocument();
});