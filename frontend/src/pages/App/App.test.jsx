
import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import App from "./App";

vi.mock("../../services/api", () => ({
    default: {
        get: vi.fn(),
    },
}));

afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
});

describe("App", () => {

    test("renders the Welcome page", async () => {
        const screen = await render(<App />);

        await expect.element(
            screen.getByRole("heading", { name: "Welcome" })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Lesson Management System")
        ).toBeInTheDocument();
    });


    test("navigates from Welcome to Login", async () => {
        const screen = await render(<App />);

        await screen.getByRole(
            "button",
            { name: "Click to Log in" }
        ).click();

        await expect.element(
            screen.getByRole("heading", { name: /login/i })
        ).toBeInTheDocument();
    });

});
