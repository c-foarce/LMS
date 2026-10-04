import { render } from "vitest-browser-react";
import { describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import Register from "./Register";

import api from "../../services/api";

vi.mock("../../services/api", () => ({
    default: {
        post: vi.fn(),
    },
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");

    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

describe("Registration", () => {
    test("renders the registration form", async () => {

        const screen = await render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByRole("heading", { name: "Register" })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByLabelText("First Name:")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByLabelText("Last Name:")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByLabelText("Username:")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByLabelText("Password:", { exact: true })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByLabelText("Confirm Password:", { exact: true })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByLabelText("Account Type:")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("button", { name: "Register" })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("button", { name: "← Back" })
        ).toBeInTheDocument();

    });

    test("displays an error when passwords do not match", async () => {

        const screen = await render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        await screen.getByLabelText("First Name:").fill("John");
        await screen.getByLabelText("Last Name:").fill("Smith");
        await screen.getByLabelText("Username:").fill("johnsmith");
        await screen.getByLabelText("Password:", { exact: true }).fill("password123");
        await screen.getByLabelText("Confirm Password:", { exact: true }).fill("different123");

        await screen.getByRole("button", { name: "Register" }).click();

        await expect.element(
            screen.getByText("Passwords do not match.")
        ).toBeInTheDocument();

        expect(api.post).not.toHaveBeenCalled();

    });


    test("successfully registers a user", async () => {

        api.post.mockResolvedValue({
            data: {}
        });

        const screen = await render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        await screen.getByLabelText("First Name:").fill("John");
        await screen.getByLabelText("Last Name:").fill("Smith");
        await screen.getByLabelText("Username:").fill("johnsmith");
        await screen.getByLabelText("Password:", { exact: true }).fill("password123");
        await screen.getByLabelText("Confirm Password:", { exact: true }).fill("password123");

        await screen.getByRole("button", { name: "Register" }).click();

        await expect.element(
            screen.getByText(
                "Registration successful! Redirecting to login..."
            )
        ).toBeInTheDocument();

        expect(api.post).toHaveBeenCalledWith(
            "accounts/register/",
            {
                username: "johnsmith",
                first_name: "John",
                last_name: "Smith",
                password: "password123",
                role: "student"
            }
        );

    });


    test("displays an error when registration API fails", async () => {

        api.post.mockRejectedValue(new Error("Registration failed"));

        const screen = await render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        await screen.getByLabelText("First Name:").fill("John");
        await screen.getByLabelText("Last Name:").fill("Smith");
        await screen.getByLabelText("Username:").fill("johnsmith");
        await screen.getByLabelText("Password:", { exact: true }).fill("password123");
        await screen.getByLabelText("Confirm Password:", { exact: true }).fill("password123");

        await screen.getByRole("button", { name: "Register" }).click();

        await expect.element(
            screen.getByText("Registration Failed.")
        ).toBeInTheDocument();

    });


    test("allows selecting the Teacher role and submits it correctly", async () => {

        api.post.mockResolvedValue({
            data: {}
        });

        const screen = await render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        await screen.getByLabelText("First Name:").fill("Jane");
        await screen.getByLabelText("Last Name:").fill("Teacher");
        await screen.getByLabelText("Username:").fill("janeteacher");
        await screen.getByLabelText("Password:", { exact: true }).fill("password123");
        await screen.getByLabelText("Confirm Password:", { exact: true }).fill("password123");

        await screen.getByLabelText("Account Type:").selectOptions("teacher");

        await screen.getByRole("button", { name: "Register" }).click();

        expect(api.post).toHaveBeenCalledWith(
            "accounts/register/",
            {
                username: "janeteacher",
                first_name: "Jane",
                last_name: "Teacher",
                password: "password123",
                role: "teacher"
            }
        );

    });

})
