import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import UserCard from "./UserCard";

const mockUser = {
    id: 1,
    username: "testuser",
    first_name: "Test",
    last_name: "User",
    email: "test@example.com",
    role: "student",
};

const mockUserNoEmail = {
    ...mockUser,
    email: "",
};

const renderUserCard = async (user = mockUser) => {
    return await render(
        <MemoryRouter>
            <UserCard user={user} />
        </MemoryRouter>
    );
};

describe("UserCard", () => {

    test("renders the user's title", async () => {
        const screen = await renderUserCard();

        await expect.element(
            screen.getByText("User: 1 | testuser")
        ).toBeVisible();
    });


    test("renders the user's name, email and role", async () => {
        const screen = await renderUserCard();

        await expect.element(
            screen.getByText("Test User")
        ).toBeVisible();

        await expect.element(
            screen.getByText("test@example.com")
        ).toBeVisible();

        await expect.element(
            screen.getByText("student")
        ).toBeVisible();
    });


    test("displays a fallback when the user has no email", async () => {
        const screen = await renderUserCard(mockUserNoEmail);

        await expect.element(
            screen.getByText("No email provided")
        ).toBeVisible();
    });


    test("renders an Edit User button", async () => {
        const screen = await renderUserCard();

        await expect.element(
            screen.getByRole("button", { name: "Edit User" })
        ).toBeVisible();
    });


    test("navigates to the user's edit page when Edit User is clicked", async () => {
        const screen = await render(
            <MemoryRouter initialEntries={["/app/accounts/all/"]}>
                <Routes>
                    <Route
                        path="/app/accounts/all/"
                        element={<UserCard user={mockUser} />}
                    />
                    <Route
                        path="/app/accounts/1/edit/"
                        element={<p>Edit User Page</p>}
                    />
                </Routes>
            </MemoryRouter>
        );

        await screen.getByRole("button", { name: "Edit User" }).click();

        await expect.element(
            screen.getByText("Edit User Page")
        ).toBeVisible();
    });

});