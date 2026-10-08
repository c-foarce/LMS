import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import StudentCourseCard from "./StudentCourseCard";

const mockCourse = {
    id: 1,
    course_name: "Mathematics",
    course_code: "MATH101",
    teacher: "teacherone",
    status: "Active",
    progress: 50,
    grade: null,
};

describe("StudentCourseCard", () => {

    test("renders the course details", async () => {
        const screen = await render(
            <StudentCourseCard
                course={mockCourse}
                onSubmitProgress={vi.fn()}
            />
        );

        await expect.element(
            screen.getByText("Mathematics")
        ).toBeVisible();

        await expect.element(
            screen.getByText("Code: MATH101")
        ).toBeVisible();

        await expect.element(
            screen.getByText("Teacher: teacherone")
        ).toBeVisible();

        await expect.element(
            screen.getByText("Status: Active")
        ).toBeVisible();

        await expect.element(
            screen.getByText("Progress: 50%")
        ).toBeVisible();
    });


    test("shows Submit Progress and Not graded when progress is below 100%", async () => {
        const screen = await render(
            <StudentCourseCard
                course={mockCourse}
                onSubmitProgress={vi.fn()}
            />
        );

        await expect.element(
            screen.getByRole("button", { name: "Submit Progress" })
        ).toBeVisible();

        await expect.element(
            screen.getByText("Grade: Not graded")
        ).toBeVisible();
    });


    test("calls onSubmitProgress with the course ID when Submit Progress is clicked", async () => {
        const onSubmitProgress = vi.fn();

        const screen = await render(
            <StudentCourseCard
                course={mockCourse}
                onSubmitProgress={onSubmitProgress}
            />
        );

        await screen.getByRole(
            "button",
            { name: "Submit Progress" }
        ).click();

        expect(onSubmitProgress).toHaveBeenCalledWith(1);
        expect(onSubmitProgress).toHaveBeenCalledTimes(1);
    });


    test("shows the grade when progress is 100%", async () => {
        const completedCourse = {
            ...mockCourse,
            progress: 100,
            grade: "A",
        };

        const screen = await render(
            <StudentCourseCard
                course={completedCourse}
                onSubmitProgress={vi.fn()}
            />
        );

        await expect.element(
            screen.getByText("Grade: A")
        ).toBeVisible();

        await expect.element(
            screen.getByRole("button", { name: "Submit Progress" })
        ).not.toBeInTheDocument();
    });


    test("shows Awaiting grade when completed course has no grade", async () => {
        const completedCourse = {
            ...mockCourse,
            progress: 100,
            grade: null,
        };

        const screen = await render(
            <StudentCourseCard
                course={completedCourse}
                onSubmitProgress={vi.fn()}
            />
        );

        await expect.element(
            screen.getByText("Grade: Awaiting grade")
        ).toBeVisible();
    });


    test("does not show Awaiting grade for an incomplete course", async () => {
        const screen = await render(
            <StudentCourseCard
                course={mockCourse}
                onSubmitProgress={vi.fn()}
            />
        );

        await expect.element(
            screen.getByText("Grade: Not graded")
        ).toBeVisible();

        await expect.element(
            screen.getByText("Grade: Awaiting grade")
        ).not.toBeInTheDocument();
    });

});