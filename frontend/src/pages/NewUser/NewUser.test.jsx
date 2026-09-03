import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import NewUser from "./NewUser";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

const mockFields = [
    {
        name: "username",
        required: true,
        type: "CharField",
    },
    {
        name: "role",
        required: true,
        choices: [
            { value: "student", label: "Student" },
            { value: "teacher", label: "Teacher" },
            { value: "admin", label: "Admin" },
        ],
    },
    {
        name: "description",
        required: false,
        type: "TextField",
    },
    {
        name: "password",
        required: true,
        type: "CharField",
    },
];

afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
});

describe("NewUser", () => {

    test("fetches user fields when the component loads", async () => {
        api.get.mockResolvedValue({
            data: {
                fields: mockFields,
            },
        });

        await render(<NewUser />);

        expect(api.get).toHaveBeenCalledWith(
            "/accounts/user-fields/"
        );
    });


    test("renders the fields returned by the API", async () => {
        api.get.mockResolvedValue({
            data: {
                fields: mockFields,
            },
        });

        const screen = await render(<NewUser />);

        await expect.element(
            screen.getByText("New User Page")
        ).toBeVisible();

        await expect.element(
            screen.getByLabelText("username")
        ).toBeVisible();

        await expect.element(
            screen.getByLabelText("role")
        ).toBeVisible();

        await expect.element(
            screen.getByLabelText("description")
        ).toBeVisible();

        await expect.element(
            screen.getByLabelText("password")
        ).toBeVisible();
    });


    test("renders a select for fields with choices", async () => {
        api.get.mockResolvedValue({
            data: {
                fields: mockFields,
            },
        });

        const screen = await render(<NewUser />);

        const role = screen.getByLabelText("role");

        await expect.element(role).toBeVisible();

        expect(
            screen.getByRole("option", { name: "Student" })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("option", { name: "Teacher" })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("option", { name: "Admin" })
        ).toBeInTheDocument();
    });

    test("renders a textarea for TextField fields", async () => {
        api.get.mockResolvedValue({
            data: {
                fields: mockFields,
            },
        });

        const screen = await render(<NewUser />);

        const description = screen.getByLabelText("description");

        await expect.element(description).toBeVisible();
    });


    test("updates form data when fields are changed", async () => {
        api.get.mockResolvedValue({
            data: {
                fields: mockFields,
            },
        });

        const screen = await render(<NewUser />);

        const fields = {
            username: screen.getByLabelText("username"),
            role: screen.getByLabelText("role"),
            description: screen.getByLabelText("description"),
            password: screen.getByLabelText("password"),
        };

        await fields.username.fill("testuser");
        await fields.role.selectOptions("student");
        await fields.description.fill("Test description");
        await fields.password.fill("password123");

        await expect.element(
            screen.getByText(/"username": "testuser"/)
        ).toBeVisible();

        await expect.element(
            screen.getByText(/"role": "student"/)
        ).toBeVisible();

        await expect.element(
            screen.getByText(/"description": "Test description"/)
        ).toBeVisible();

        await expect.element(
            screen.getByText(/"password": "password123"/)
        ).toBeVisible();
    });


    test("posts the entered form data when the form is submitted", async () => {
        api.get.mockResolvedValue({
            data: {
                fields: mockFields,
            },
        });

        api.post.mockResolvedValue({
            data: {
                id: 1,
                username: "testuser",
                role: "student",
            },
        });

        const screen = await render(<NewUser />);

        const fields = {
            username: screen.getByLabelText("username"),
            role: screen.getByLabelText("role"),
            password: screen.getByLabelText("password"),
        };

        await fields.username.fill("testuser");
        await fields.role.selectOptions("student");
        await fields.password.fill("password123");

        await screen.getByRole("button", {
            name: "Submit",
        }).click();

        expect(api.post).toHaveBeenCalledWith(
            "/accounts/create/",
            {
                username: "testuser",
                role: "student",
                password: "password123",
            }
        );
    });


    test("shows a success message after a successful user creation", async () => {
        api.get.mockResolvedValue({
            data: {
                fields: mockFields,
            },
        });

        api.post.mockResolvedValue({
            data: {
                id: 1,
                username: "testuser",
            },
        });

        const screen = await render(<NewUser />);

        const fields = {
            username: screen.getByLabelText("username"),
            password: screen.getByLabelText("password"),
        };

        await fields.username.fill("testuser");
        await fields.password.fill("password123");
        await screen.getByLabelText("role").selectOptions("student");

        await screen.getByRole("button", { name: "Submit" }).click();

        await expect.element(
            screen.getByText("User sucessfully created!")
        ).toBeVisible();
    });


    test("clears the form and success message after 3 seconds", async () => {
        vi.useFakeTimers();

        api.get.mockResolvedValue({
            data: {
                fields: mockFields,
            },
        });

        api.post.mockResolvedValue({
            data: {
                id: 1,
                username: "testuser",
            },
        });

        const screen = await render(<NewUser />);

        const fields = {
            username: screen.getByLabelText("username"),
            password: screen.getByLabelText("password"),
        };

        await fields.username.fill("testuser");
        await fields.password.fill("password123");
        await screen.getByLabelText("role").selectOptions("student");

        await screen.getByRole("button", { name: "Submit" }).click();

        await expect.element(
            screen.getByText("User sucessfully created!")
        ).toBeVisible();

        vi.advanceTimersByTime(3000);

        await expect.element(
            screen.getByText("User sucessfully created!")
        ).not.toBeInTheDocument();

        await expect.element(
            screen.getByText("{}")
        ).toBeVisible();
    });

    test("requires a role to be selected before submitting", async () => {
        api.get.mockResolvedValue({
            data: { fields: mockFields },
        });

        const screen = await render(<NewUser />);

        const role = screen.getByLabelText("role");

        await expect.element(role).toHaveValue("");

        expect(
            screen.getByRole("option", { name: "Select Role" })
        ).toBeInTheDocument();

        await screen.getByRole("button", { name: "Submit" }).click();

        expect(api.post).not.toHaveBeenCalled();
    });

});