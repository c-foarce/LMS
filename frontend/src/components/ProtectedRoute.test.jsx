import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
    MemoryRouter,
    Routes,
    Route,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

const mockUseAuth = vi.fn();

vi.mock("../context/AuthContext", () => ({
    useAuth: () => mockUseAuth(),
}));

afterEach(() => {
    vi.clearAllMocks();
});

describe("ProtectedRoute Tests", async () => {

    test("displays loading while authentication is loading", async () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: true,
        });

        const screen = await render(
            <MemoryRouter>
                <ProtectedRoute>
                    <p>Protected Content</p>
                </ProtectedRoute>
            </MemoryRouter>
        );

        await expect.element(
            screen.getByText("Loading...")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Protected Content")
        ).not.toBeInTheDocument();
    });

    test("renders children when user is authenticated", async () => {
        mockUseAuth.mockReturnValue({
            user: { role: "student" },
            loading: false,
        });

        const screen = await render(
            <MemoryRouter>
                <ProtectedRoute>
                    <p>Protected Content</p>
                </ProtectedRoute>
            </MemoryRouter>
        );

        await expect.element(
            screen.getByText("Protected Content")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Loading...")
        ).not.toBeInTheDocument();
    });

    test("redirects unauthenticated users to login", async () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: false,
        });

        const screen = await render(
            <MemoryRouter initialEntries={["/app/dashboard/"]}>
                <Routes>

                    <Route
                        path="/app/dashboard/"
                        element={
                            <ProtectedRoute>
                                <p>Protected Content</p>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/login"
                        element={<h1>Login Page</h1>}
                    />

                </Routes>
            </MemoryRouter>
        );

        await expect.element(
            screen.getByRole("heading", { name: "Login Page" })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Protected Content")
        ).not.toBeInTheDocument();
    });
    
})
