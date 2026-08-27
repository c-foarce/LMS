import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router-dom";

import CourseCard from "./CourseCard";


import {
    mockCourse,
    mockInactiveCourse
} from '../../test/mocks/displaycards'

test("displays course details", async () => {
    const screen = await render(
        <MemoryRouter>
            <CourseCard
                course={mockCourse}
                role="teacher"
            />
        </MemoryRouter>
    );

    await expect.element(
        screen.getByRole("heading", {
            name: mockCourse.subject_name
        })
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText("Subject:", { exact: true })
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText(mockCourse.subject_name, { exact: true })
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText("Code:", { exact: true })
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText(mockCourse.code)
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText("Teacher:", { exact: true })
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText(mockCourse.teacher_name)
    ).toBeInTheDocument();
});