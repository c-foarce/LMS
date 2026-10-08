import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import StudentGradeCard from "./StudentGradeCard";

const mockStudent = {
    student_name: "Student One",
    grade: null,
};

describe("StudentGradeCard", () => {

    test("renders the student name and awaiting grade when no grade exists", async () => {
        const screen = await render(
            <StudentGradeCard
                student={mockStudent}
                editing={false}
                selectedGrade=""
                onEdit={vi.fn()}
                onGradeChange={vi.fn()}
                onSave={vi.fn()}
                onCancel={vi.fn()}
            />
        );

        await expect.element(
            screen.getByText("Student: Student One")
        ).toBeVisible();

        await expect.element(
            screen.getByText("Grade: Awaiting grade")
        ).toBeVisible();
    });


    test("renders all grade options for an ungraded student", async () => {
        const screen = await render(
            <StudentGradeCard
                student={mockStudent}
                editing={false}
                selectedGrade=""
                onEdit={vi.fn()}
                onGradeChange={vi.fn()}
                onSave={vi.fn()}
                onCancel={vi.fn()}
            />
        );

        await expect.element(
            screen.getByRole("option", { name: "Select grade" })
        ).toBeInTheDocument();

        for (const grade of ["A", "B", "C", "D", "F"]) {
            await expect.element(
                screen.getByRole("option", { name: grade, exact: true })
            ).toBeInTheDocument();
        }
    });


    test("calls onGradeChange when a grade is selected", async () => {
        const onGradeChange = vi.fn();

        const screen = await render(
            <StudentGradeCard
                student={mockStudent}
                editing={false}
                selectedGrade=""
                onEdit={vi.fn()}
                onGradeChange={onGradeChange}
                onSave={vi.fn()}
                onCancel={vi.fn()}
            />
        );

        await screen.getByRole("combobox").selectOptions("A");

        expect(onGradeChange).toHaveBeenCalledWith("A");
        expect(onGradeChange).toHaveBeenCalledTimes(1);
    });


    test("shows Save Grade after a grade has been selected", async () => {
        const screen = await render(
            <StudentGradeCard
                student={mockStudent}
                editing={false}
                selectedGrade="A"
                onEdit={vi.fn()}
                onGradeChange={vi.fn()}
                onSave={vi.fn()}
                onCancel={vi.fn()}
            />
        );

        await expect.element(
            screen.getByRole("button", { name: "Save Grade" })
        ).toBeVisible();
    });


    test("displays an existing grade and Change Grade button when not editing", async () => {
        const gradedStudent = {
            ...mockStudent,
            grade: "B",
        };

        const onEdit = vi.fn();

        const screen = await render(
            <StudentGradeCard
                student={gradedStudent}
                editing={false}
                selectedGrade=""
                onEdit={onEdit}
                onGradeChange={vi.fn()}
                onSave={vi.fn()}
                onCancel={vi.fn()}
            />
        );

        await expect.element(
            screen.getByText("Grade: B")
        ).toBeVisible();

        await expect.element(
            screen.getByRole("button", { name: "Change Grade" })
        ).toBeVisible();

        await screen.getByRole(
            "button",
            { name: "Change Grade" }
        ).click();

        expect(onEdit).toHaveBeenCalledTimes(1);
    });


    test("shows editing controls for an existing grade", async () => {
        const gradedStudent = {
            ...mockStudent,
            grade: "B",
        };

        const onCancel = vi.fn();

        const screen = await render(
            <StudentGradeCard
                student={gradedStudent}
                editing={true}
                selectedGrade=""
                onEdit={vi.fn()}
                onGradeChange={vi.fn()}
                onSave={vi.fn()}
                onCancel={onCancel}
            />
        );

        await expect.element(
            screen.getByRole("combobox")
        ).toBeVisible();

        await expect.element(
            screen.getByRole("button", { name: "Cancel" })
        ).toBeVisible();

        await expect.element(
            screen.getByRole("button", { name: "Save Grade" })
        ).not.toBeInTheDocument();

        await screen.getByRole(
            "button",
            { name: "Cancel" }
        ).click();

        expect(onCancel).toHaveBeenCalledTimes(1);
    });


    test("calls onSave when Save Grade is clicked", async () => {
        const onSave = vi.fn();

        const screen = await render(
            <StudentGradeCard
                student={mockStudent}
                editing={false}
                selectedGrade="A"
                onEdit={vi.fn()}
                onGradeChange={vi.fn()}
                onSave={onSave}
                onCancel={vi.fn()}
            />
        );

        await screen.getByRole(
            "button",
            { name: "Save Grade" }
        ).click();

        expect(onSave).toHaveBeenCalledTimes(1);
    });

});