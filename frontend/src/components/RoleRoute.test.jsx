import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router-dom";

import RoleRoute from "./RoleRoute";

const mockUseAuth = vi.fn();

vi.mock("../context/AuthContext", () => ({
    useAuth: () => mockUseAuth(),
}));

vi.mock("./DeniedAccess", () => ({
    default: () => <div>Access Denied Mock</div>,
}));

const renderRoleRoute = async (roles, user, loading = false) => {
    mockUseAuth.mockReturnValue({
        user,
        loading,
    });

    return render(
        <MemoryRouter>
            <RoleRoute roles={roles}>
                <p>Protected Content</p>
            </RoleRoute>
        </MemoryRouter>
    );
};

afterEach(() => {
    vi.clearAllMocks();
});

test("displays loading while authentication is loading", async () => {
    const screen = await renderRoleRoute(
        ["student"],
        null,
        true
    );

    await expect.element(
        screen.getByText("Loading...")
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText("Protected Content")
    ).not.toBeInTheDocument();
});

test("renders children when user has an allowed role", async () => {
    const screen = await renderRoleRoute(
        ["student"],
        { role: "student" }
    );

    await expect.element(
        screen.getByText("Protected Content")
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText("Access Denied Mock")
    ).not.toBeInTheDocument();
});

test("renders denied access when user does not have an allowed role", async () => {
    const screen = await renderRoleRoute(
        ["teacher"],
        { role: "student" }
    );

    await expect.element(
        screen.getByText("Access Denied Mock")
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText("Protected Content")
    ).not.toBeInTheDocument();
});