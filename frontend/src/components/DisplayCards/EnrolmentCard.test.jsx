import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router-dom";

import EnrolmentCard from "./EnrolmentCard";

import { mockEnrolment, mockEnrolmentNoTeacher } from '../../test/mocks/displaycards'

const onDelete = vi.fn()

const renderEnrolmentCard = async (props = {}) => {
    return await render(
        <MemoryRouter>
            <EnrolmentCard
                enrolment={mockEnrolment}
                onDelete={onDelete}
                {...props}
            />
        </MemoryRouter>
    )
}

test("displays the student and course code", async () => {
    const screen = await renderEnrolmentCard();

    await expect.element(
        screen.getByRole("heading", {
            name: "teststudent - MATH101"
        })
    ).toBeInTheDocument();
});

test("display the headings for each major datapoint of an enrolment", async () => {
    const screen = await renderEnrolmentCard();

    await expect.element(
        screen.getByText("Course:")
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText("Code:")
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText("Teacher:")
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText("Status:")
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText("Progress:")
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText("Grade:")
    ).toBeInTheDocument();
});

test("data from enrolment is displayed", async () => {
    const screen = await renderEnrolmentCard({
        enrolment: {
            ...mockEnrolment,
            progress: 100,
            grade: "C"
        }
    }); //this test is not for ungraded, separate test for later

    const courseParent = screen.getByText("Course:").locator("..");
    await expect.element(courseParent).toHaveTextContent("Mathematics");

    const codeParent = screen.getByText("Code:").locator("..");
    await expect.element(codeParent).toHaveTextContent("MATH101");

    const teacherParent = screen.getByText("Teacher:").locator("..");
    await expect.element(teacherParent).toHaveTextContent("testteacher");

    const statusParent = screen.getByText("Status:").locator("..");
    await expect.element(statusParent).toHaveTextContent("Active");

    const progressParent = screen.getByText("Progress:").locator("..");
    await expect.element(progressParent).toHaveTextContent("100%");

    const gradeParent = screen.getByText("Grade:").locator("..");
    await expect.element(gradeParent).toHaveTextContent("C");
});

test(`display "Not graded" when a grade does not exist`, async () => {
    const screen = await renderEnrolmentCard();

    const gradeParent = screen.getByText("Grade:").locator("..");
    await expect.element(gradeParent).toHaveTextContent("Not graded");
})

test(`displays "N/A" when there is no teacher`, async () => {
    const screen = await renderEnrolmentCard({
        enrolment: mockEnrolmentNoTeacher
    })

    const teacherParent = screen.getByText("Teacher:").locator("..");
    await expect.element(teacherParent).toHaveTextContent("N/A")
})

test("display the delete button", async (s) => {
    const screen = await renderEnrolmentCard();

    await expect.element(
        screen.getByRole("button", {
            name: "Delete"
        })
    ).toBeInTheDocument()

})

test("clicking the delete button calls onDelete with the correct id", async () => {
    const screen = await renderEnrolmentCard();

    await screen.getByRole(
        "button",
        { name: "Delete" }
    ).click();

    expect(onDelete).toHaveBeenCalledWith(mockEnrolment.id)
})


