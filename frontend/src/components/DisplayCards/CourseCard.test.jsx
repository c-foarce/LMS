import { afterEach, describe, expect, test, vi } from "vitest";
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

const renderCourseCard = async (props = {}) => {
    return await render(
        <MemoryRouter>
            <CourseCard
                course={mockCourse}
                role=""
                onDelete={onDelete}
                onToggleActive={onToggleActive}
                onEdit={onEdit}
                onEnrol={onEnrol}
                loadingError={null}
                deleteError={null}
                deleteErrorCourseId={null}
                updateActiveError={null}
                updateActiveErrorCourseId={null}
                enrolError={null}
                enrolErrorCourseId={null}
                {...props}
            />
        </MemoryRouter>
    );
};

afterEach(() => {
    vi.clearAllMocks();
});


describe("Student Tests", () => {

    test("displays course details", async () => {
        const screen = await renderCourseCard({
            role: "student"
        })

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

    test("student displays required submissions", async () => {
        const screen = await renderCourseCard({
            role: "student"
        })

        await expect.element(
            screen.getByText("Required Submissions:", { exact: true })
        ).toBeInTheDocument();

    });

    test("student displays enrol button", async () => {
        const screen = await renderCourseCard({
            role: "student"
        })

        await expect.element(
            screen.getByRole("button", {
                name: "Enrol"
            })
        ).toBeInTheDocument();
    });

    test("student enrol button calls onEnrol with course ID", async () => {

        const screen = await renderCourseCard({
            role: "student"
        })

        await screen.getByRole("button", {
            name: "Enrol"
        }).click();

        expect(onEnrol).toHaveBeenCalledWith(mockCourse.id);
    });

    test("student displays enrol error for matching course", async () => {
        const screen = await renderCourseCard({
            role: "student",
            enrolError: "Could not enrol in this course",
            enrolErrorCourseId: mockCourse.id
        })

        await expect.element(
            screen.getByText("Could not enrol in this course", { exact: true })
        ).toBeInTheDocument();
    });
});


describe("Admin Tests", () => {

    test("displays ID and status", async () => {
        const screen = await renderCourseCard({
            role: "admin"
        })

        await expect.element(
            screen.getByText("ID:", { exact: true })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Status:", { exact: true })
        ).toBeInTheDocument();
    });

    test("displays admin actions", async () => {
        const screen = await renderCourseCard({
            role: "admin"
        })

        await expect.element(
            screen.getByRole("button", {
                name: "Delete Course"
            })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("button", {
                name: "Deactivate"
            })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("button", {
                name: "Edit"
            })
        ).toBeInTheDocument();
    });

    test("delete button calls onDelete with course ID", async () => {

        const screen = await renderCourseCard({
            role: "admin"
        })

        await screen.getByRole("button", {
            name: "Delete Course"
        }).click();

        expect(onDelete).toHaveBeenCalledWith(mockCourse.id);
    });

    test("deactivate button calls onToggleActive with course ID", async () => {
        const screen = await renderCourseCard({
            role: "admin"
        })

        await screen.getByRole("button", {
            name: "Deactivate"
        }).click();

        expect(onToggleActive).toHaveBeenCalledWith(mockCourse.id);
    });

    test("edit button calls onEdit with course ID", async () => {
        const screen = await renderCourseCard({
            role: "admin"
        })

        await screen.getByRole("button", {
            name: "Edit"
        }).click();

        expect(onEdit).toHaveBeenCalledWith(mockCourse.id);
    });

    test("displays Activate for an inactive course", async () => {
        const screen = await renderCourseCard({
            role: "admin",
            course: mockInactiveCourse
        })

        await expect.element(
            screen.getByRole("button", {
                name: "Activate"
            })
        ).toBeInTheDocument();
    });

    test("displays error for matching course", async () => {
        const screen = await renderCourseCard({
            role: "admin",
            deleteError: "Could not delete Course.",
            deleteErrorCourseId: mockCourse.id
        })

        await expect.element(
            screen.getByText("Could not delete Course.", { exact: true })
        ).toBeInTheDocument();
    });

})