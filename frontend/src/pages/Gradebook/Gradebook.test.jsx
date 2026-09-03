import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router-dom";

import Gradebook from "./Gradebook";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn(),
    },
}));

const mockCourses = [
    {
        id: 1,
        subject_name: "Mathematics",
        code: "MATH101",
        completed_students: [
            {
                id: 10,
                student_name: "studentone",
                grade: "A",
            },
            {
                id: 11,
                student_name: "studenttwo",
                grade: null,
            },
        ],
    },
    {
        id: 2,
        subject_name: "Computer Science",
        code: "CS101",
        completed_students: [
            {
                id: 12,
                student_name: "studentthree",
                grade: "B",
            },
        ],
    },
];

const renderGradebook = async () => {
    return render(
        <MemoryRouter>
            <Gradebook />
        </MemoryRouter>
    );
};

afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
});

describe("Gradebook", () => {

    test("shows loading state while progress is being retrieved", async () => {
        api.get.mockReturnValue(new Promise(() => {}));

        const screen = await renderGradebook();

        await expect.element(
            screen.getByText("Loading...")
        ).toBeInTheDocument();

        expect(api.get).toHaveBeenCalledWith(
            "/courses/teaching/progress/"
        );
    });


    test("displays courses and students returned by the API", async () => {
        api.get.mockResolvedValue({
            data: mockCourses,
        });

        const screen = await renderGradebook();

        await expect.element(
            screen.getByRole("heading", {
                name: "Mathematics (MATH101)",
                level: 2,
            })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("heading", {
                name: "Computer Science (CS101)",
                level: 2,
            })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Student: studentone")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Student: studenttwo")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Student: studentthree")
        ).toBeInTheDocument();
    });


    test("displays an error when progress cannot be retrieved", async () => {
        api.get.mockRejectedValue(new Error("Request failed"));

        const screen = await renderGradebook();

        await expect.element(
            screen.getByText("Failed to retrieve student progress.")
        ).toBeInTheDocument();
    });


    test("filters courses by the selected course", async () => {
        api.get.mockResolvedValue({
            data: mockCourses,
        });

        const screen = await renderGradebook();

        const courseFilter = screen.getByLabelText("Course:");

        await courseFilter.selectOptions("2");

        await expect.element(
            screen.getByRole("heading", {
                name: "Computer Science (CS101)",
                level: 2,
            })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("heading", {
                name: "Mathematics (MATH101)",
                level: 2,
            })
        ).not.toBeInTheDocument();
    });


    test("filters students to only those with grades", async () => {
        api.get.mockResolvedValue({
            data: mockCourses,
        });

        const screen = await renderGradebook();

        const gradeFilter = screen.getByLabelText("Grade Status:");

        await gradeFilter.selectOptions("graded");

        await expect.element(
            screen.getByText("Student: studentone")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Student: studentthree")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Student: studenttwo")
        ).not.toBeInTheDocument();
    });


    test("filters students to only those awaiting a grade", async () => {
        api.get.mockResolvedValue({
            data: mockCourses,
        });

        const screen = await renderGradebook();

        const gradeFilter = screen.getByLabelText("Grade Status:");

        await gradeFilter.selectOptions("awaiting");

        await expect.element(
            screen.getByText("Student: studenttwo")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Student: studentone")
        ).not.toBeInTheDocument();

        await expect.element(
            screen.getByText("Student: studentthree")
        ).not.toBeInTheDocument();
    });


    test("keeps the course visible when no students match the selected filter", async () => {
        api.get.mockResolvedValue({
            data: mockCourses,
        });

        const screen = await renderGradebook();

        const gradeFilter = screen.getByLabelText("Grade Status:");

        await gradeFilter.selectOptions("awaiting");

        await expect.element(
            screen.getByRole("heading", {
                name: "Computer Science (CS101)",
                level: 2,
            })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText(
                "No students match the selected filters."
            )
        ).toBeInTheDocument();
    });


    test("saves a grade for a student awaiting a grade", async () => {
        api.get.mockResolvedValue({
            data: mockCourses,
        });

        api.patch.mockResolvedValue({
            data: {},
        });

        const screen = await renderGradebook();

        const student = screen.getByText("Student: studenttwo");

        const card = student.locator("..");

        const gradeSelect = card.getByRole("combobox");

        await gradeSelect.selectOptions("A");

        await expect.element(
            card.getByRole("button", {
                name: "Save Grade",
            })
        ).toBeInTheDocument();

        await card.getByRole("button", {
            name: "Save Grade",
        }).click();

        expect(api.patch).toHaveBeenCalledWith(
            "/courses/enrolments/11/grade/",
            {
                grade: "A",
            }
        );

        await expect.element(
            card.getByText("Grade: A")
        ).toBeInTheDocument();
    });


    test("changes an existing grade", async () => {
        api.get.mockResolvedValue({
            data: mockCourses,
        });

        api.patch.mockResolvedValue({
            data: {},
        });

        const screen = await renderGradebook();

        const student = screen.getByText("Student: studentone");

        const card = student.locator("..");

        await card.getByRole("button", {
            name: "Change Grade",
        }).click();

        const gradeSelect = card.getByRole("combobox");

        await gradeSelect.selectOptions("C");

        await card.getByRole("button", {
            name: "Save Grade",
        }).click();

        expect(api.patch).toHaveBeenCalledWith(
            "/courses/enrolments/10/grade/",
            {
                grade: "C",
            }
        );

        await expect.element(
            card.getByText("Grade: C")
        ).toBeInTheDocument();

        await expect.element(
            card.getByRole("button", {
                name: "Change Grade",
            })
        ).toBeInTheDocument();
    });


    test("cancels an existing grade edit without saving", async () => {
        api.get.mockResolvedValue({
            data: mockCourses,
        });

        const screen = await renderGradebook();

        const student = screen.getByText("Student: studentone");

        const card = student.locator("..");

        await card.getByRole("button", {
            name: "Change Grade",
        }).click();

        await expect.element(
            card.getByRole("button", {
                name: "Cancel",
            })
        ).toBeInTheDocument();

        await card.getByRole("button", {
            name: "Cancel",
        }).click();

        expect(api.patch).not.toHaveBeenCalled();

        await expect.element(
            card.getByText("Grade: A")
        ).toBeInTheDocument();

        await expect.element(
            card.getByRole("button", {
                name: "Change Grade",
            })
        ).toBeInTheDocument();
    });

});