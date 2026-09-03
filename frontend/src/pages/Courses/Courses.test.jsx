import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import Courses from "./Courses";

import api from "../../services/api";

import { useAuth } from "../../context/AuthContext";

import {
    mockStudent,
    mockTeacher,
} from "../../test/mocks/auth";

vi.mock("../../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../services/api", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
    },
}));

vi.mock("../../components/DisplayCards/StudentCourseCard", () => ({
    default: ({ course, onSubmitProgress }) => (
        <div>
            <p>{course.course_name}</p>
            <button onClick={() => onSubmitProgress(course.id)}>
                Submit Progress
            </button>
        </div>
    ),
}));

vi.mock("../../components/DisplayCards/TeacherCourseCard", () => ({
    default: ({ course, onToggleActive, onEdit }) => (
        <div>
            <p>{course.subject_name}</p>
            <button onClick={() => onToggleActive(course.id)}>
                Toggle Active
            </button>
            <button onClick={onEdit}>
                Edit Course
            </button>
        </div>
    ),
}));

afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
});


describe("Courses", () => {

    test("shows loading while courses are being fetched", async () => {
        useAuth.mockReturnValue({
            user: mockStudent,
        });

        api.get.mockReturnValue(new Promise(() => { }));

        const screen = await render(
            <MemoryRouter>
                <Courses />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByText("Loading...")
        ).toBeInTheDocument();
    });


    test("fetches and displays courses for a student", async () => {
        useAuth.mockReturnValue({
            user: mockStudent,
        });

        api.get.mockResolvedValue({
            data: [
                {
                    id: 1,
                    course_name: "Mathematics",
                    course_code: "MATH101",
                },
            ],
        });

        const screen = await render(
            <MemoryRouter>
                <Courses />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByText("Mathematics")
        ).toBeInTheDocument();

        expect(api.get).toHaveBeenCalledWith(
            "/courses/enrolments/me/"
        );
    });


    test("fetches and displays courses for a teacher", async () => {
        useAuth.mockReturnValue({
            user: mockTeacher,
        });

        api.get.mockResolvedValue({
            data: [
                {
                    id: 1,
                    subject_name: "Mathematics",
                    code: "MATH101",
                    is_active: true,
                },
            ],
        });

        const screen = await render(
            <MemoryRouter>
                <Courses />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByText("Mathematics")
        ).toBeInTheDocument();

        expect(api.get).toHaveBeenCalledWith(
            "/courses/teaching/dashboard/"
        );
    });


    test("shows an empty state when no courses are found", async () => {
        useAuth.mockReturnValue({
            user: mockStudent,
        });

        api.get.mockResolvedValue({
            data: [],
        });

        const screen = await render(
            <MemoryRouter>
                <Courses />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByText("No courses found.")
        ).toBeInTheDocument();
    });


    test("shows an error when fetching courses fails", async () => {
        useAuth.mockReturnValue({
            user: mockStudent,
        });

        api.get.mockRejectedValue({
            response: {
                data: {
                    detail: "Unable to retrieve courses.",
                },
            },
        });

        const screen = await render(
            <MemoryRouter>
                <Courses />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByText("Unable to retrieve courses.")
        ).toBeInTheDocument();
    });


    test("submits progress successfully", async () => {
        useAuth.mockReturnValue({
            user: mockStudent,
        });

        api.get.mockResolvedValue({
            data: [
                {
                    id: 1,
                    course_name: "Mathematics",
                    course_code: "MATH101",
                },
            ],
        });

        api.post.mockResolvedValue({
            data: {
                id: 1,
                course_name: "Mathematics",
                course_code: "MATH101",
                progress: 50,
            },
        });

        vi.spyOn(window, "confirm").mockReturnValue(true);

        const screen = await render(
            <MemoryRouter>
                <Courses />
            </MemoryRouter>
        );

        await screen.getByRole(
            "button",
            { name: "Submit Progress" }
        ).click();

        expect(api.post).toHaveBeenCalledWith(
            "/courses/enrolments/1/submit/"
        );

        await expect.element(
            screen.getByText("Progress submitted successfully")
        ).toBeInTheDocument();
    });


    test("does not submit progress when confirmation is cancelled", async () => {
        useAuth.mockReturnValue({
            user: mockStudent,
        });

        api.get.mockResolvedValue({
            data: [
                {
                    id: 1,
                    course_name: "Mathematics",
                },
            ],
        });

        vi.spyOn(window, "confirm").mockReturnValue(false);

        const screen = await render(
            <MemoryRouter>
                <Courses />
            </MemoryRouter>
        );

        await screen.getByRole(
            "button",
            { name: "Submit Progress" }
        ).click();

        expect(api.post).not.toHaveBeenCalled();
    });


    test("toggles a teacher course active state", async () => {
        useAuth.mockReturnValue({
            user: mockTeacher,
        });

        api.get.mockResolvedValue({
            data: [
                {
                    id: 1,
                    subject_name: "Mathematics",
                    code: "MATH101",
                    is_active: true,
                },
            ],
        });

        api.patch.mockResolvedValue({
            data: {
                is_active: false,
            },
        });

        const screen = await render(
            <MemoryRouter>
                <Courses />
            </MemoryRouter>
        );

        await screen.getByRole(
            "button",
            { name: "Toggle Active" }
        ).click();

        expect(api.patch).toHaveBeenCalledWith(
            "/courses/1/toggle-active/"
        );
    });


    test("navigates to the course edit page", async () => {
        useAuth.mockReturnValue({
            user: mockTeacher,
        });

        api.get.mockResolvedValue({
            data: [
                {
                    id: 5,
                    subject_name: "Mathematics",
                    code: "MATH101",
                },
            ],
        });

        const screen = await render(
            <MemoryRouter initialEntries={["/app/courses/"]}>
                <Routes>
                    <Route path="/app/courses/" element={<Courses />} />
                    <Route
                        path="/app/courses/5/edit"
                        element={<p>Edit Course Page</p>}
                    />
                </Routes>
            </MemoryRouter>
        );

        await screen.getByRole(
            "button",
            { name: "Edit Course" }
        ).click();

        await expect.element(
            screen.getByText("Edit Course Page")
        ).toBeInTheDocument();
    });

});