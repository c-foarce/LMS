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
        },
        {
            id: 2,
            subject_name: "History",
            code: "HIST101",
            is_active: false,
            teacher_name: "teacherone",
        },
        {
            id: 3,
            subject_name: "English",
            code: "ENG101",
            is_active: true,
            teacher_name: "teacherone",
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
        },
        {
            id: 2,
            subject_name: "History",
            code: "HIST101",
            is_active: false,
            teacher_name: "teacherone",
        },
        {
            id: 3,
            subject_name: "English",
            code: "ENG101",
            is_active: true,
            teacher_name: "teacherone",
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
        { name: "Delete" }
    ).click();

    expect(deleteMock).toHaveBeenCalledWith(
        "/courses/10/delete/"
    );

    await expect.element(
        screen.getByRole(
            "heading",
            { name: "Course List" }
        )
    ).toBeInTheDocument();
});