import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";

import HistoryRecordCard from "./HistoryRecordCard";

const mockRecord = {
    course_name: "Mathematics",
    course_code: "MATH101",
    student_first_name: "Student",
    student_last_name: "One",
    teacher_username: "teacherone",
    grade: "A",
    completed_at: "2026-08-30T14:30:00Z",
};

describe("HistoryRecordCard", () => {

    test("renders the course name and code", async () => {
        const screen = await render(
            <HistoryRecordCard record={mockRecord} />
        );

        await expect.element(
            screen.getByRole("heading", { name: "Mathematics" })
        ).toBeVisible();

        await expect.element(
            screen.getByText("Code:", { exact: false })
        ).toBeVisible();

        await expect.element(
            screen.getByText("MATH101", { exact: true })
        ).toBeVisible();
    });


    test("renders the student, teacher and grade", async () => {
        const screen = await render(
            <HistoryRecordCard record={mockRecord} />
        );

        await expect.element(
            screen.getByText("Student:", { exact: false })
        ).toBeVisible();

        await expect.element(
            screen.getByText("Student One", { exact: true })
        ).toBeVisible();

        await expect.element(
            screen.getByText("Teacher:", { exact: false })
        ).toBeVisible();

        await expect.element(
            screen.getByText("teacherone", { exact: true })
        ).toBeVisible();

        await expect.element(
            screen.getByText("Grade:", { exact: false })
        ).toBeVisible();

        await expect.element(
            screen.getByText("A", { exact: true })
        ).toBeVisible();
    });


    test("formats and displays the completion date", async () => {
        const screen = await render(
            <HistoryRecordCard record={mockRecord} />
        );

        await expect.element(
            screen.getByText("Completed:", { exact: false })
        ).toBeVisible();

        await expect.element(
            screen.getByText(
                /30 August 2026 at 15:30/
            )
        ).toBeVisible();
    });

});