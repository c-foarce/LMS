import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router-dom";

import NewEnrolment from "./NewEnrolment";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

const mockStudents = [
    {
        id: 1,
        username: "studentone",
    },
    {
        id: 2,
        username: "studenttwo",
    },
];

const mockCourses = [
    {
        id: 10,
        subject_name: "Mathematics",
    },
    {
        id: 20,
        subject_name: "Computer Science",
    },
];

const renderNewEnrolment = async () => {
    return render(
        <MemoryRouter>
            <NewEnrolment />
        </MemoryRouter>
    );
};

afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
});

describe("NewEnrolment", () => {

    test("fetches students and available courses when the page loads", async () => {
        api.get
            .mockResolvedValueOnce({
                data: mockStudents,
            })
            .mockResolvedValueOnce({
                data: mockCourses,
            });

        await renderNewEnrolment();

        expect(api.get).toHaveBeenNthCalledWith(
            1,
            "/accounts/students/"
        );

        expect(api.get).toHaveBeenNthCalledWith(
            2,
            "/courses/available/"
        );
    });


    test("displays available students and courses", async () => {
        api.get
            .mockResolvedValueOnce({
                data: mockStudents,
            })
            .mockResolvedValueOnce({
                data: mockCourses,
            });

        const screen = await renderNewEnrolment();

        const studentSelect = screen.getByLabelText("Student");
        const courseSelect = screen.getByLabelText("Course");

        await expect.element(
            studentSelect.getByRole("option", {
                name: "studentone",
            })
        ).toBeInTheDocument();

        await expect.element(
            studentSelect.getByRole("option", {
                name: "studenttwo",
            })
        ).toBeInTheDocument();

        await expect.element(
            courseSelect.getByRole("option", {
                name: "Mathematics",
            })
        ).toBeInTheDocument();

        await expect.element(
            courseSelect.getByRole("option", {
                name: "Computer Science",
            })
        ).toBeInTheDocument();
    });


    test("updates form data when student and course are selected", async () => {
        api.get
            .mockResolvedValueOnce({
                data: mockStudents,
            })
            .mockResolvedValueOnce({
                data: mockCourses,
            });

        const screen = await renderNewEnrolment();

        const studentSelect = screen.getByLabelText("Student");
        const courseSelect = screen.getByLabelText("Course");

        await studentSelect.selectOptions("1");
        await courseSelect.selectOptions("10");

        await expect.element(studentSelect).toHaveValue("1");
        await expect.element(courseSelect).toHaveValue("10");
    });


    test("successfully creates a new enrolment", async () => {
        api.get
            .mockResolvedValueOnce({
                data: mockStudents,
            })
            .mockResolvedValueOnce({
                data: mockCourses,
            });

        api.post.mockResolvedValue({
            data: {
                id: 100,
                student: 1,
                course: 10,
            },
        });

        const screen = await renderNewEnrolment();

        await screen.getByLabelText("Student").selectOptions("1");
        await screen.getByLabelText("Course").selectOptions("10");

        await screen.getByRole("button", {
            name: "Submit Enrolment",
        }).click();

        expect(api.post).toHaveBeenCalledWith(
            "/courses/enrolments/create/",
            {
                student: "1",
                course: "10",
            }
        );

        await expect.element(
            screen.getByText("Enrolment sucessfully created!")
        ).toBeInTheDocument();
    });


    test("resets the form after successful enrolment creation", async () => {
        vi.useFakeTimers();

        api.get
            .mockResolvedValueOnce({
                data: mockStudents,
            })
            .mockResolvedValueOnce({
                data: mockCourses,
            });

        api.post.mockResolvedValue({
            data: {
                id: 100,
                student: 1,
                course: 10,
            },
        });

        const screen = await renderNewEnrolment();

        const studentSelect = screen.getByLabelText("Student");
        const courseSelect = screen.getByLabelText("Course");

        await studentSelect.selectOptions("1");
        await courseSelect.selectOptions("10");

        await screen.getByRole("button", {
            name: "Submit Enrolment",
        }).click();

        await expect.element(
            screen.getByText("Enrolment sucessfully created!")
        ).toBeInTheDocument();

        vi.advanceTimersByTime(3000);

        await expect.element(studentSelect).toHaveValue("");
        await expect.element(courseSelect).toHaveValue("");
    });


    test("displays the API error when enrolment creation fails", async () => {
        api.get
            .mockResolvedValueOnce({
                data: mockStudents,
            })
            .mockResolvedValueOnce({
                data: mockCourses,
            });

        api.post.mockRejectedValue({
            response: {
                data: {
                    detail: "Student is already enrolled in this course.",
                },
            },
        });

        const screen = await renderNewEnrolment();

        await screen.getByLabelText("Student").selectOptions("1");
        await screen.getByLabelText("Course").selectOptions("10");

        await screen.getByRole("button", {
            name: "Submit Enrolment",
        }).click();

        await expect.element(
            screen.getByText(
                "Student is already enrolled in this course."
            )
        ).toBeInTheDocument();
    });

});