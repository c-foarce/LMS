import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import {
    AuthProvider,
    useAuth,
} from "./AuthContext";

import api from "../services/api";

vi.mock("../services/api", () => ({
    default: {
        get: vi.fn(),
    },
}));

const TestConsumer = () => {
    const { user, setUser, loading } = useAuth();

    return (
        <div>
            <p data-testid="loading">
                {loading ? "loading" : "loaded"}
            </p>

            <p data-testid="user">
                {user ? user.username : "No user"}
            </p>
        </div>
    );
};

afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
});

describe("AuthProvider", () => {

    test("stops loading without making an API request when there is no access token", async () => {
        const screen = await render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await expect.element(
            screen.getByTestId("loading")
        ).toHaveTextContent("loaded");

        expect(api.get).not.toHaveBeenCalled();
    });


    test("sets the user when the access token is valid", async () => {
        const mockUser = {
            username: "teststudent",
            role: "student",
        };

        localStorage.setItem("access", "test-access-token");

        api.get.mockResolvedValue({
            data: mockUser,
        });

        const screen = await render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await expect.element(
            screen.getByTestId("loading")
        ).toHaveTextContent("loaded");

        await expect.element(
            screen.getByTestId("user")
        ).toHaveTextContent("teststudent");

        expect(api.get).toHaveBeenCalledWith(
            "/accounts/user-role/"
        );
    });


    test("clears the user when the authentication request fails", async () => {
        localStorage.setItem("access", "invalid-token");

        api.get.mockRejectedValue(
            new Error("Authentication failed")
        );

        const screen = await render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await expect.element(
            screen.getByTestId("loading")
        ).toHaveTextContent("loaded");

        await expect.element(
            screen.getByTestId("user")
        ).toHaveTextContent("No user");

        expect(api.get).toHaveBeenCalledWith(
            "/accounts/user-role/"
        );
    });
});