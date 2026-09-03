import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import UserList from "./UserList";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

import { MemoryRouter } from "react-router-dom";

import { mockAdminUsers } from "../../test/mocks/dashboard";

vi.mock("../../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../services/api", () => ({
    default: {
        get: vi.fn(),
    },
}));

const renderUserList = async () => {
    return await render(
        <MemoryRouter>
            <UserList />
        </MemoryRouter>
    );
};

describe("UserList", () => {

    afterEach(() => {
        vi.clearAllMocks();
    });


    test("shows a loading message while users are being fetched", async () => {
        useAuth.mockReturnValue({
            user: { role: "admin" },
        });

        api.get.mockReturnValue(new Promise(() => { }));

        const screen = await renderUserList();

        await expect.element(
            screen.getByText("Loading...")
        ).toBeVisible();
    });


    test("fetches users from the correct endpoint", async () => {
        useAuth.mockReturnValue({
            user: { role: "admin" },
        });

        api.get.mockResolvedValue({
            data: mockAdminUsers,
        });

        await renderUserList();

        expect(api.get).toHaveBeenCalledWith("/accounts/all/");
        expect(api.get).toHaveBeenCalledTimes(1);
    });


    test("renders UserCards for the returned users", async () => {
        useAuth.mockReturnValue({
            user: { role: "admin" },
        });

        api.get.mockResolvedValue({
            data: mockAdminUsers,
        });

        const screen = await renderUserList();

        for (const user of mockAdminUsers) {
            await expect.element(
                screen.getByText(user.username)
            ).toBeVisible();
        }
    });


    test("shows an empty-state message when no users are returned", async () => {
        useAuth.mockReturnValue({
            user: { role: "admin" },
        });

        api.get.mockResolvedValue({
            data: [],
        });

        const screen = await renderUserList();

        await expect.element(
            screen.getByText("Connection successful, no users found.")
        ).toBeVisible();
    });


    test("shows an error message when the API request fails", async () => {
        useAuth.mockReturnValue({
            user: { role: "admin" },
        });

        api.get.mockRejectedValue(
            new Error("Failed to fetch users")
        );

        const screen = await renderUserList();

        await expect.element(
            screen.getByText("Failed to retreive User data.")
        ).toBeVisible();
    });

});