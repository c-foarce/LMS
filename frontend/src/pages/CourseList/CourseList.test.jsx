import { afterEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
    MemoryRouter,
    Routes,
    Route,
} from "react-router-dom";

import CourseList from "./CourseList";
import api from "../../services/api";

import { useAuth } from "../../context/AuthContext";

import {
    mockAdminCourses,
} from "../../test/mocks/dashboard";

vi.mock("../../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));


afterEach(() => {
    vi.restoreAllMocks();
});


test("displays loading while courses are being retrieved", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "admin",
        },
    });

    vi.spyOn(api, "get")
        .mockImplementation(
            () => new Promise(() => { })
        );

    const screen = await render(
        <MemoryRouter>
            <CourseList />
        </MemoryRouter>
    );

    await expect.element(
        screen.getByText("Loading...")
    ).toBeInTheDocument();
});

test("requests all courses for an admin", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "admin",
        },
    });

    const getMock = vi
        .spyOn(api, "get")
        .mockResolvedValue({
            data: mockAdminCourses,
        });

    await render(
        <MemoryRouter>
            <CourseList />
        </MemoryRouter>
    );

    expect(getMock).toHaveBeenCalledWith(
        "/courses/list/"
    );
});


test("requests available courses and enrolments for a student", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "student",
        },
    });

    const getMock = vi
        .spyOn(api, "get")
        .mockImplementation((url) => {

            if (url === "/courses/list/") {
                return Promise.resolve({
                    data: mockAdminCourses,
                });
            }

            if (url === "/courses/enrolments/me") {
                return Promise.resolve({
                    data: [],
                });
            }

            return Promise.reject(
                new Error(`Unexpected URL: ${url}`)
            );
        });

    await render(
        <MemoryRouter>
            <CourseList />
        </MemoryRouter>
    );

    expect(getMock).toHaveBeenCalledWith(
        "/courses/list/"
    );

    expect(getMock).toHaveBeenCalledWith(
        "/courses/enrolments/me"
    );
});

test("student only sees active courses they are not already enrolled on", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "student",
        },
    });

    const courses = [
        {
            id: 1,
            subject_name: "Mathematics",
            code: "MATH101",
            is_active: true,
            teacher_name: "teacherone",
            total_submissions: 4
        },
        {
            id: 2,
            subject_name: "History",
            code: "HIST101",
            is_active: false,
            teacher_name: "teacherone",
            total_submissions: 2

        },
        {
            id: 3,
            subject_name: "English",
            code: "ENG101",
            is_active: true,
            teacher_name: "teacherone",
            total_submissions: 7

        },
    ];

    const enrolments = [
        {
            course: 3,
        },
    ];

    vi.spyOn(api, "get")
        .mockImplementation((url) => {

            if (url === "/courses/list/") {
                return Promise.resolve({
                    data: courses,
                });
            }

            if (url === "/courses/enrolments/me") {
                return Promise.resolve({
                    data: enrolments,
                });
            }

            return Promise.reject(
                new Error(`Unexpected URL: ${url}`)
            );
        });

    const screen = await render(
        <MemoryRouter>
            <CourseList />
        </MemoryRouter>
    );

    await expect.element(
        screen.getByRole(
            "heading",
            { name: "Mathematics" }
        )
    ).toBeInTheDocument();

    await expect.element(
        screen.getByRole(
            "heading",
            { name: "History" }
        )
    ).not.toBeInTheDocument();

    await expect.element(
        screen.getByRole(
            "heading",
            { name: "English" }
        )
    ).not.toBeInTheDocument();
});

test("displays the student empty state when no courses are available", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "student",
        },
    });

    vi.spyOn(api, "get")
        .mockResolvedValue({
            data: [],
        });

    const screen = await render(
        <MemoryRouter>
            <CourseList />
        </MemoryRouter>
    );

    await expect.element(
        screen.getByText(
            "There are currently no courses available to enrol on."
        )
    ).toBeInTheDocument();
});

test("displays the standard empty state when no courses are found", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "admin",
        },
    });

    vi.spyOn(api, "get")
        .mockResolvedValue({
            data: [],
        });

    const screen = await render(
        <MemoryRouter>
            <CourseList />
        </MemoryRouter>
    );

    await expect.element(
        screen.getByText("No courses found.")
    ).toBeInTheDocument();
});

test("navigates to the course edit page when Edit Course is clicked", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "admin",
        },
    });

    const course = {
        id: 10,
        subject_name: "Physics",
        code: "PHY101",
        is_active: true,
        teacher_name: "teacherone",
    };

    vi.spyOn(api, "get")
        .mockResolvedValue({
            data: [course],
        });

    const screen = await render(
        <MemoryRouter initialEntries={["/app/courses"]}>
            <Routes>
                <Route
                    path="/app/courses"
                    element={<CourseList />}
                />

                <Route
                    path="/app/courses/10/edit/"
                    element={<h1>Edit Course Page</h1>}
                />
            </Routes>
        </MemoryRouter>
    );

    await screen.getByRole(
        "button",
        { name: "Edit" }
    ).click();

    await expect.element(
        screen.getByRole(
            "heading",
            { name: "Edit Course Page" }
        )
    ).toBeInTheDocument();
});

test("deletes a course after confirmation", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "admin",
        },
    });

    const course = {
        id: 10,
        subject_name: "Physics",
        code: "PHY101",
        is_active: true,
        teacher_name: "teacherone",
    };

    vi.spyOn(window, "confirm")
        .mockReturnValue(true);

    const deleteMock = vi
        .spyOn(api, "delete")
        .mockResolvedValue({});

    vi.spyOn(api, "get")
        .mockResolvedValue({
            data: [course],
        });

    const screen = await render(
        <MemoryRouter>
            <CourseList />
        </MemoryRouter>
    );

    await screen.getByRole(
        "button",
        { name: "Delete Course" }
    ).click();

    expect(deleteMock).toHaveBeenCalledWith(
        "/courses/10/delete/"
    );

    await expect.element(
        screen.getByRole(
            "heading",
            { name: "Physics" }
        )
    ).not.toBeInTheDocument();
});

test("does not delete a course when deletion is cancelled", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "admin",
        },
    });

    vi.spyOn(window, "confirm")
        .mockReturnValue(false);

    const deleteMock = vi.spyOn(api, "delete");

    vi.spyOn(api, "get")
        .mockResolvedValue({
            data: [mockAdminCourses[0]],
        });

    const screen = await render(
        <MemoryRouter>
            <CourseList />
        </MemoryRouter>
    );

    await screen.getByRole(
        "button",
        { name: "Delete Course" }
    ).click();

    expect(deleteMock).not.toHaveBeenCalled();

    await expect.element(
        screen.getByRole(
            "heading",
            {
                name: mockAdminCourses[0].subject_name
            }
        )
    ).toBeInTheDocument();
});

test("displays an error when deleting a course fails", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "admin",
        },
    });

    vi.spyOn(window, "confirm")
        .mockReturnValue(true);

    vi.spyOn(api, "get")
        .mockResolvedValue({
            data: [mockAdminCourses[0]],
        });

    const deleteMock = vi
        .spyOn(api, "delete")
        .mockRejectedValue({
            response: {
                data: {
                    detail: "Could not delete Course.",
                },
            },
        });

    const screen = await render(
        <MemoryRouter>
            <CourseList />
        </MemoryRouter>
    );

    await screen.getByRole(
        "button",
        { name: "Delete Course" }
    ).click();

    expect(deleteMock).toHaveBeenCalledWith(
        `/courses/${mockAdminCourses[0].id}/delete/`
    );

    await expect.element(
        screen.getByText(
            "Could not delete Course.",
            { exact: true }
        )
    ).toBeInTheDocument();

    await expect.element(
        screen.getByRole(
            "heading",
            { name: mockAdminCourses[0].subject_name }
        )
    ).toBeInTheDocument();
});

test("toggles a course active state", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "admin",
        },
    });

    const course = mockAdminCourses[0];

    const updatedCourse = {
        ...course,
        is_active: false,
    };

    vi.spyOn(api, "get")
        .mockResolvedValue({
            data: [course],
        });

    const patchMock = vi
        .spyOn(api, "patch")
        .mockResolvedValue({
            data: updatedCourse,
        });

    const screen = await render(
        <MemoryRouter>
            <CourseList />
        </MemoryRouter>
    );

    await screen.getByRole(
        "button",
        { name: "Deactivate" }
    ).click();

    expect(patchMock).toHaveBeenCalledWith(
        `/courses/${course.id}/toggle-active/`
    );

    await expect.element(
        screen.getByRole(
            "button",
            { name: "Activate" }
        )
    ).toBeInTheDocument();
});

test("displays an error when toggling a course fails", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "admin",
        },
    });

    vi.spyOn(api, "get")
        .mockResolvedValue({
            data: [mockAdminCourses[0]],
        });

    vi.spyOn(api, "patch")
        .mockRejectedValue({
            response: {
                data: {
                    detail: "Could not update course.",
                },
            },
        });

    const screen = await render(
        <MemoryRouter>
            <CourseList />
        </MemoryRouter>
    );

    await screen.getByRole(
        "button",
        { name: "Deactivate" }
    ).click();

    await expect.element(
        screen.getByText(
            "Could not update course.",
            { exact: true }
        )
    ).toBeInTheDocument();
});

test("enrols a student after confirmation", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "student",
        },
    });

    vi.spyOn(window, "confirm")
        .mockReturnValue(true);

    const course = mockAdminCourses[0];

    const newEnrolment = {
        id: 99,
        course: course.id,
    };

    vi.spyOn(api, "get")
        .mockImplementation((url) => {
            if (url === "/courses/list/") {
                return Promise.resolve({
                    data: [course],
                });
            }

            if (url === "/courses/enrolments/me") {
                return Promise.resolve({
                    data: [],
                });
            }

            return Promise.reject(
                new Error(`Unexpected URL: ${url}`)
            );
        });

    const postMock = vi
        .spyOn(api, "post")
        .mockResolvedValue({
            data: newEnrolment,
        });

    const screen = await render(
        <MemoryRouter>
            <CourseList />
        </MemoryRouter>
    );

    await screen.getByRole(
        "button",
        { name: "Enrol" }
    ).click();

    expect(postMock).toHaveBeenCalledWith(
        "/courses/enrolments/enrol/",
        {
            course: course.id,
        }
    );

    await expect.element(
        screen.getByText(
            "Successfully Enrolled",
            { exact: true }
        )
    ).toBeInTheDocument();
});

test("does not enrol when enrolment is cancelled", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "student",
        },
    });

    vi.spyOn(window, "confirm")
        .mockReturnValue(false);

    const postMock = vi.spyOn(api, "post");

    vi.spyOn(api, "get")
        .mockImplementation((url) => {
            if (url === "/courses/list/") {
                return Promise.resolve({
                    data: [mockAdminCourses[0]],
                });
            }

            if (url === "/courses/enrolments/me") {
                return Promise.resolve({
                    data: [],
                });
            }

            return Promise.reject(
                new Error(`Unexpected URL: ${url}`)
            );
        });

    const screen = await render(
        <MemoryRouter>
            <CourseList />
        </MemoryRouter>
    );

    await screen.getByRole(
        "button",
        { name: "Enrol" }
    ).click();

    expect(postMock).not.toHaveBeenCalled();
});

test("displays an error when enrolment fails", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "student",
        },
    });

    vi.spyOn(window, "confirm")
        .mockReturnValue(true);

    vi.spyOn(api, "get")
        .mockImplementation((url) => {
            if (url === "/courses/list/") {
                return Promise.resolve({
                    data: [mockAdminCourses[0]],
                });
            }

            if (url === "/courses/enrolments/me") {
                return Promise.resolve({
                    data: [],
                });
            }

            return Promise.reject(
                new Error(`Unexpected URL: ${url}`)
            );
        });

    vi.spyOn(api, "post")
        .mockRejectedValue({
            response: {
                data: {
                    detail: "Already enrolled.",
                },
            },
        });

    const screen = await render(
        <MemoryRouter>
            <CourseList />
        </MemoryRouter>
    );

    await screen.getByRole(
        "button",
        { name: "Enrol" }
    ).click();

    await expect.element(
        screen.getByText(
            "Already enrolled.",
            { exact: true }
        )
    ).toBeInTheDocument();
});

test("admin sees active and inactive courses", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "admin",
        },
    });

    vi.spyOn(api, "get")
        .mockResolvedValue({
            data: mockAdminCourses,
        });

    const screen = await render(
        <MemoryRouter>
            <CourseList />
        </MemoryRouter>
    );

    await expect.element(
        screen.getByRole(
            "heading",
            { name: "Mathematics" }
        )
    ).toBeInTheDocument();

    await expect.element(
        screen.getByRole(
            "heading",
            { name: "Computer Science" }
        )
    ).toBeInTheDocument();
});

test("removes the course from the student list after successful enrolment", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "student",
        },
    });

    vi.spyOn(window, "confirm")
        .mockReturnValue(true);

    const course = mockAdminCourses[0];

    vi.spyOn(api, "get")
        .mockImplementation((url) => {
            if (url === "/courses/list/") {
                return Promise.resolve({
                    data: [course],
                });
            }

            if (url === "/courses/enrolments/me") {
                return Promise.resolve({
                    data: [],
                });
            }

            return Promise.reject(
                new Error(`Unexpected URL: ${url}`)
            );
        });

    vi.spyOn(api, "post")
        .mockResolvedValue({
            data: {
                id: 99,
                course: course.id,
            },
        });

    const screen = await render(
        <MemoryRouter>
            <CourseList />
        </MemoryRouter>
    );

    await screen.getByRole(
        "button",
        { name: "Enrol" }
    ).click();

    await expect.element(
        screen.getByRole(
            "heading",
            { name: course.subject_name }
        )
    ).not.toBeInTheDocument();
});

test("displays an error when courses cannot be retrieved", async () => {
    vi.mocked(useAuth).mockReturnValue({
        user: {
            role: "admin",
        },
    });

    vi.spyOn(api, "get")
        .mockRejectedValue({
            response: {
                data: {
                    detail: "Failed to retrieve courses.",
                },
            },
        });

    const screen = await render(
        <MemoryRouter>
            <CourseList />
        </MemoryRouter>
    );

    await expect.element(
        screen.getByText(
            "Failed to retrieve courses.",
            { exact: true }
        )
    ).toBeInTheDocument();
});