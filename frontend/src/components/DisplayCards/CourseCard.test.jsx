import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router-dom";

import CourseCard from "./CourseCard";

import {
    mockCourse,
    mockInactiveCourse
} from '../../test/mocks/displaycards'

const onDelete = vi.fn();
const onToggleActive = vi.fn();
const onEdit = vi.fn();
const onEnrol = vi.fn();

test("displays course details", async () => {
    const screen = await render(
        <MemoryRouter>
            <CourseCard
                course={mockCourse}
                role="student"
                onDelete={onDelete}
                onToggleActive={onToggleActive}
                onEdit={onEdit}
                onEnrol={onEnrol}
                error={null}
                errorCourseId={null}
                enrolError={null}
                enrolErrorCourseId={null}
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
        screen.getByText("Code:", { exact: true })
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText("Teacher:", { exact: true })
    ).toBeInTheDocument();
});