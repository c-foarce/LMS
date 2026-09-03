import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router-dom";

import MyGrades from "./MyGrades";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
    default: {
        get: vi.fn(),
    },
}));

const mockGrades = [
    {
        id: 1,
        course_name: "Mathematics",
        course_code: "MATH101",
        grade: "A",
    },
    {
        id: 2,
        course_name: "Computer Science",
        course_code: "CS101",
        grade: "B",
    },
];

const renderMyGrades = async () => {
    return render(
        <MemoryRouter>
            <MyGrades />
        </MemoryRouter>
    );
};

afterEach(() => {
    vi.clearAllMocks();
});

describe("MyGrades", () => {

    test("shows loading state while grades are being retrieved", async () => {
        api.get.mockReturnValue(new Promise(() => {}));

        const screen = await renderMyGrades();

        await expect.element(
            screen.getByText("Loading...")
        ).toBeInTheDocument();
    });

    test("displays retrieved grades", async () => {
        api.get.mockResolvedValue({
            data: mockGrades,
        });

        const screen = await renderMyGrades();

        await expect.element(
            screen.getByRole("heading", { name: "My Grades" })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("heading", {
                name: "Mathematics (MATH101)",
            })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Grade: A")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("heading", {
                name: "Computer Science (CS101)",
            })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Grade: B")
        ).toBeInTheDocument();
    });

    test("shows empty state when no graded courses are returned", async () => {
        api.get.mockResolvedValue({
            data: [],
        });

        const screen = await renderMyGrades();

        await expect.element(
            screen.getByText("You don't have any graded courses yet.")
        ).toBeInTheDocument();
    });

    test("shows error when grades cannot be retrieved", async () => {
        api.get.mockRejectedValue(new Error("API error"));

        const screen = await renderMyGrades();

        await expect.element(
            screen.getByText("Failed to Load grades.")
        ).toBeInTheDocument();
    });

});