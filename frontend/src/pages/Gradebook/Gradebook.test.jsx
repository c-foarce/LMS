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

const openFilters = async (screen) => {
    await screen.getByText("Search & Filters").click();
};

afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
});

describe("Gradebook", () => {

    test("shows loading state while progress is being retrieved", async () => {
        api.get.mockReturnValue(new Promise(() => { }));

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
            screen.getByText("Mathematics (MATH101)").last()
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Computer Science (CS101)").last()
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("studentone")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("studenttwo")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("studentthree")
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

        await openFilters(screen);

        const courseFilter = screen.getByLabelText("Course:");

        await courseFilter.selectOptions("2");

        await expect.element(
            screen.getByText("Computer Science (CS101)").last()
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Student: studentone")
        ).not.toBeInTheDocument();
    });


    test("filters students to only those with grades", async () => {
        api.get.mockResolvedValue({
            data: mockCourses,
        });

        const screen = await renderGradebook();
        await openFilters(screen);

        const gradeFilter = screen.getByLabelText("Grade Status:");
        await gradeFilter.selectOptions("graded");

        await expect.element(screen.getByText("studentone")).toBeInTheDocument();
        await expect.element(screen.getByText("studentthree")).toBeInTheDocument();
        await expect.element(screen.getByText("studenttwo")).not.toBeInTheDocument();
    });


    test("filters students to only those awaiting a grade", async () => {
        api.get.mockResolvedValue({
            data: mockCourses,
        });

        const screen = await renderGradebook();
        await openFilters(screen);

        const gradeFilter = screen.getByLabelText("Grade Status:");
        await gradeFilter.selectOptions("awaiting");

        await expect.element(screen.getByText("studenttwo")).toBeInTheDocument();
        await expect.element(screen.getByText("studentone")).not.toBeInTheDocument();
        await expect.element(screen.getByText("studentthree")).not.toBeInTheDocument();
    });

    test("hides courses when no students match the selected grade filter", async () => {
        api.get.mockResolvedValue({
            data: mockCourses,
        });

        const screen = await renderGradebook();
        await openFilters(screen);

        const gradeFilter = screen.getByLabelText("Grade Status:");
        await gradeFilter.selectOptions("awaiting");

        await expect.element(
            screen.getByText("studenttwo")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByTestId("course-2")
        ).not.toBeInTheDocument();
    });

    test("saves a grade for a student awaiting a grade", async () => {
        api.get.mockResolvedValue({
            data: mockCourses,
        });

        api.patch.mockResolvedValue({
            data: {},
        });

        const screen = await renderGradebook();

        await screen.getByText("Mathematics (MATH101)").last().click();

        const gradeSelect = screen.getByLabelText(
            "Select grade for studenttwo"
        );

        await gradeSelect.selectOptions("A");

        await screen.getByRole("button", {
            name: "Save Grade",
        }).click();

        expect(api.patch).toHaveBeenCalledWith(
            "/courses/enrolments/11/grade/",
            { grade: "A" }
        );

        await expect.element(
            screen.getByText("studenttwo")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Grade:", { exact: true }).last()
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("A", { exact: true }).last()
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

        await screen.getByText("Mathematics (MATH101)").last().click();

        const student = screen.getByText("studentone");
        const card = student.locator("..");

        await card.getByRole("button", { name: "Change Grade" }).click();

        const gradeSelect = screen.getByLabelText(
            "Select grade for studentone"
        );
        await gradeSelect.selectOptions("C");

        await card.getByRole("button", { name: "Save Grade" }).click();

        expect(api.patch).toHaveBeenCalledWith(
            "/courses/enrolments/10/grade/",
            { grade: "C" }
        );

        await expect.element(card.getByText("Grade:")).toBeInTheDocument();
        await expect.element(card.getByText("C", { exact: true })).toBeInTheDocument();

        await expect.element(
            card.getByRole("button", { name: "Change Grade" })
        ).toBeInTheDocument();
    });


    test("cancels an existing grade edit without saving", async () => {
        api.get.mockResolvedValue({
            data: mockCourses,
        });

        const screen = await renderGradebook();

        await screen.getByText("Mathematics (MATH101)").last().click();

        const student = screen.getByText("studentone");
        const card = student.locator("..");

        await card.getByRole("button", { name: "Change Grade" }).click();

        await expect.element(
            card.getByRole("button", { name: "Cancel" })
        ).toBeInTheDocument();

        await card.getByRole("button", { name: "Cancel" }).click();

        expect(api.patch).not.toHaveBeenCalled();

        await expect.element(card.getByText("Grade:")).toBeInTheDocument();
        await expect.element(
            card.getByText("A", { exact: true })
        ).toBeInTheDocument();

        await expect.element(
            card.getByRole("button", { name: "Change Grade" })
        ).toBeInTheDocument();
    });

    test("course accordions start collapsed", async () => {
        api.get.mockResolvedValue({
            data: mockCourses,
        });

        const screen = await renderGradebook();

        const courseSummary = screen.getByText(
            "Mathematics (MATH101)"
        ).last();

        const course = courseSummary.locator("..");

        await expect.element(course).not.toHaveAttribute("open");
    });

    test("outstanding grading count stays accurate when filtering graded students", async () => {
        api.get.mockResolvedValue({
            data: mockCourses,
        });

        const screen = await renderGradebook();

        await openFilters(screen);


        const gradeFilter = screen.getByLabelText("Grade Status:");

        await gradeFilter.selectOptions("graded");

        await expect.element(
            screen.getByText("1 awaiting grading")
        ).toBeInTheDocument();
    });

});