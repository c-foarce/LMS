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
            screen.getByText("Mathematics")
        ).toBeVisible();

        await expect.element(
            screen.getByText("Code: MATH101")
        ).toBeVisible();
    });


    test("renders the student, teacher and grade", async () => {
        const screen = await render(
            <HistoryRecordCard record={mockRecord} />
        );

        await expect.element(
            screen.getByText("Student: Student One")
        ).toBeVisible();

        await expect.element(
            screen.getByText("Teacher: teacherone")
        ).toBeVisible();

        await expect.element(
            screen.getByText("Grade: A")
        ).toBeVisible();
    });


    test("formats and displays the completion date", async () => {
        const screen = await render(
            <HistoryRecordCard record={mockRecord} />
        );

        await expect.element(
            screen.getByText("Completed: 30 August 2026 at 15:30")
        ).toBeVisible();
    });

});