import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
    MemoryRouter,
    Route,
    Routes,
} from "react-router-dom";

import EditUser from "./EditUser";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const mockUser = {
    id: 5,
    username: "testuser",
    first_name: "Test",
    last_name: "User",
    role: "student",
};

const mockAdmin = {
    id: 1,
    username: "admin",
    role: "admin",
};

vi.mock("../../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../services/api", () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

const renderEditUser = async (
    currentUser = mockAdmin,
    userId = 5
) => {
    useAuth.mockReturnValue({
        user: currentUser,
    });

    return render(
        <MemoryRouter initialEntries={[`/app/accounts/${userId}/edit`]}>
            <Routes>
                <Route
                    path="/app/accounts/:id/edit"
                    element={<EditUser />}
                />
                <Route
                    path="/app/accounts/all/"
                    element={<p>User List</p>}
                />
            </Routes>
        </MemoryRouter>
    );
};

const setupSuccessfulFetch = () => {
    api.get.mockResolvedValue({
        data: mockUser,
    });
};

afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
});

describe("EditUser", () => {

    test("shows loading while the user is being fetched", async () => {
        api.get.mockReturnValue(new Promise(() => { }));

        const screen = await renderEditUser();

        await expect.element(
            screen.getByText("Loading...")
        ).toBeInTheDocument();
    });


    test("fetches and displays the user details", async () => {
        setupSuccessfulFetch();

        const screen = await renderEditUser();

        await expect.element(
            screen.getByRole("textbox", { name: "Username:" })
        ).toHaveValue("testuser");

        await expect.element(
            screen.getByRole("textbox", { name: "First Name:" })
        ).toHaveValue("Test");

        await expect.element(
            screen.getByRole("textbox", { name: "Last Name:" })
        ).toHaveValue("User");

        await expect.element(
            screen.getByText("Role: student")
        ).toBeInTheDocument();

        expect(api.get).toHaveBeenCalledWith(
            "/accounts/users/5/"
        );
    });


    test("shows an error when fetching the user fails", async () => {
        api.get.mockRejectedValue({
            response: {
                data: {
                    detail: "Unable to retrieve user.",
                },
            },
        });

        const screen = await renderEditUser();

        await expect.element(
            screen.getByText("Unable to retrieve user.")
        ).toBeInTheDocument();
    });


    test("updates the user without sending a password", async () => {
        vi.useFakeTimers()

        setupSuccessfulFetch();

        api.patch.mockResolvedValue({
            data: {
                ...mockUser,
                first_name: "Updated",
            },
        });

        const screen = await renderEditUser();

        await screen.getByRole(
            "textbox",
            { name: "First Name:" }
        ).fill("Updated");

        await screen.getByRole(
            "button",
            { name: "Save Changes" }
        ).click();

        expect(api.patch).toHaveBeenCalledWith(
            "/accounts/users/5/edit/",
            {
                username: "testuser",
                first_name: "Updated",
                last_name: "User",
            }
        );

        await expect.element(
            screen.getByText("User updated successfully!")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("button", { name: "Saving..." })
        ).toBeDisabled();
    });


    test("updates the user with a new password", async () => {
        vi.useFakeTimers()
        
        setupSuccessfulFetch();

        api.patch.mockResolvedValue({
            data: mockUser,
        });

        const screen = await renderEditUser();

        await screen.getByRole(
            "textbox",
            { name: "New Password:", exact: true }
        ).fill("newpassword123");
        await screen.getByRole(
            "textbox",
            { name: "Confirm New Password:" }
        ).fill("newpassword123");

        await screen.getByRole(
            "button",
            { name: "Save Changes" }
        ).click();

        expect(api.patch).toHaveBeenCalledWith(
            "/accounts/users/5/edit/",
            {
                username: "testuser",
                first_name: "Test",
                last_name: "User",
                password: "newpassword123",
            }
        );
    });


    test("requires a password when confirmation is entered", async () => {
        setupSuccessfulFetch();

        const screen = await renderEditUser();

        await screen.getByRole(
            "textbox",
            { name: "Confirm New Password:" }
        ).fill("newpassword123");

        await screen.getByRole(
            "button",
            { name: "Save Changes" }
        ).click();

        await expect.element(
            screen.getByText("Please enter a new password.")
        ).toBeInTheDocument();

        expect(api.patch).not.toHaveBeenCalled();
    });


    test("rejects mismatched passwords", async () => {
        setupSuccessfulFetch();

        const screen = await renderEditUser();

        await screen.getByRole(
            "textbox",
            { name: "New Password:", exact: true }
        ).fill("newpassword123");

        await screen.getByRole(
            "textbox",
            { name: "Confirm New Password:" }
        ).fill("differentpassword");

        await screen.getByRole(
            "button",
            { name: "Save Changes" }
        ).click();

        await expect.element(
            screen.getByText("Passwords do not match.")
        ).toBeInTheDocument();

        expect(api.patch).not.toHaveBeenCalled();
    });


    test("shows an error when updating the user fails", async () => {
        setupSuccessfulFetch();

        api.patch.mockRejectedValue({
            response: {
                data: {
                    detail: "Unable to update user.",
                },
            },
        });

        const screen = await renderEditUser();

        await screen.getByRole(
            "button",
            { name: "Save Changes" }
        ).click();

        await expect.element(
            screen.getByText("Unable to update user.")
        ).toBeInTheDocument();
    });


    test("does not show the delete button when editing yourself", async () => {
        setupSuccessfulFetch();

        const screen = await renderEditUser(
            mockUser,
            5
        );

        expect(
            screen.getByRole(
                "button",
                { name: "Delete User" }
            )
        ).not.toBeInTheDocument();
    });


    test("does not delete the user when confirmation is cancelled", async () => {
        setupSuccessfulFetch();

        vi.spyOn(window, "confirm").mockReturnValue(false);

        const screen = await renderEditUser(
            mockAdmin,
            5
        );

        await screen.getByRole(
            "button",
            { name: "Delete User" }
        ).click();

        expect(api.delete).not.toHaveBeenCalled();
    });


    test("deletes a user successfully", async () => {
        vi.useFakeTimers();

        let resolveDelete;

        api.delete.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveDelete = resolve;
                })
        );

        window.confirm = vi.fn(() => true);

        const screen = await renderEditUser();

        await screen.getByRole(
            "button",
            { name: "Delete User" }
        ).click();

        await expect.element(
            screen.getByRole(
                "button",
                { name: "Deleting..." }
            )
        ).toBeDisabled();

        expect(api.delete).toHaveBeenCalledWith(
            "/accounts/5/delete/"
        );

        resolveDelete();

        await expect.element(
            screen.getByText("User deleted successfully.")
        ).toBeInTheDocument();
    });

});