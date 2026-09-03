import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import TeacherCourseCard from "./TeacherCourseCard";

const mockCourse = {
    id: 1,
    subject_name: "Mathematics",
    code: "MATH101",
    is_active: true,
    total_students: 10,
    active_students: 7,
    completed_students: 2,
    dropped_students: 1,
};

describe("TeacherCourseCard", () => {

    test("renders the course details and active status", async () => {
        const screen = await render(
            <TeacherCourseCard
                course={mockCourse}
                onToggleActive={vi.fn()}
                onEdit={vi.fn()}
            />
        );

        await expect.element(
            screen.getByText("Mathematics (MATH101)")
        ).toBeVisible();

        await expect.element(
            screen.getByText("Status: Active")
        ).toBeVisible();

        await expect.element(
            screen.getByText("Total Students: 10")
        ).toBeVisible();

        await expect.element(
            screen.getByText("Active Students: 7")
        ).toBeVisible();

        await expect.element(
            screen.getByText("Completed Students: 2")
        ).toBeVisible();

        await expect.element(
            screen.getByText("Dropped Students: 1")
        ).toBeVisible();
    });


    test("renders the inactive status and Activate Course button", async () => {
        const inactiveCourse = {
            ...mockCourse,
            is_active: false,
        };

        const screen = await render(
            <TeacherCourseCard
                course={inactiveCourse}
                onToggleActive={vi.fn()}
                onEdit={vi.fn()}
            />
        );

        await expect.element(
            screen.getByText("Status: Inactive")
        ).toBeVisible();

        await expect.element(
            screen.getByRole("button", {
                name: "Activate Course",
            })
        ).toBeVisible();

        await expect.element(
            screen.getByRole("button", {
                name: "Deactivate Course",
            })
        ).not.toBeInTheDocument();
    });


    test("does not display the course code when no code is provided", async () => {
        const courseWithoutCode = {
            ...mockCourse,
            code: "",
        };

        const screen = await render(
            <TeacherCourseCard
                course={courseWithoutCode}
                onToggleActive={vi.fn()}
                onEdit={vi.fn()}
            />
        );

        await expect.element(
            screen.getByText("Mathematics")
        ).toBeVisible();

        await expect.element(
            screen.getByText("Mathematics (MATH101)")
        ).not.toBeInTheDocument();
    });


    test("deactivates an active course when the toggle button is clicked", async () => {
        const onToggleActive = vi.fn();

        const screen = await render(
            <TeacherCourseCard
                course={mockCourse}
                onToggleActive={onToggleActive}
                onEdit={vi.fn()}
            />
        );

        await screen.getByRole(
            "button",
            { name: "Deactivate Course" }
        ).click();

        expect(onToggleActive).toHaveBeenCalledWith(1);
        expect(onToggleActive).toHaveBeenCalledTimes(1);
    });


    test("activates an inactive course when the toggle button is clicked", async () => {
        const inactiveCourse = {
            ...mockCourse,
            is_active: false,
        };

        const onToggleActive = vi.fn();

        const screen = await render(
            <TeacherCourseCard
                course={inactiveCourse}
                onToggleActive={onToggleActive}
                onEdit={vi.fn()}
            />
        );

        await screen.getByRole(
            "button",
            { name: "Activate Course" }
        ).click();

        expect(onToggleActive).toHaveBeenCalledWith(1);
        expect(onToggleActive).toHaveBeenCalledTimes(1);
    });


    test("calls onEdit when Edit Course is clicked", async () => {
        const onEdit = vi.fn();

        const screen = await render(
            <TeacherCourseCard
                course={mockCourse}
                onToggleActive={vi.fn()}
                onEdit={onEdit}
            />
        );

        await screen.getByRole(
            "button",
            { name: "Edit Course" }
        ).click();

        expect(onEdit).toHaveBeenCalledTimes(1);
    });

});