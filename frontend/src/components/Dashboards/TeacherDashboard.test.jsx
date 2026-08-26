import { afterEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
    MemoryRouter,
    Route,
    Routes,
} from "react-router-dom";

import TeacherDashboard from "./TeacherDashboard";
import api from "../../services/api";

import {
    mockTeacherCourses,
    mockTeacherProgress,
} from "../../test/mocks/dashboard";

afterEach(() => {
    vi.restoreAllMocks();
});

test("can import TeacherDashboard", () => {
    expect(TeacherDashboard).toBeDefined();
});

test("displays loading while dashboard data is being retrieved", async () => {

    vi.spyOn(api, "get")
        .mockImplementation(
            () => new Promise(() => { })
        );

    const screen = await render(
        <MemoryRouter>
            <TeacherDashboard />
        </MemoryRouter>
    );

    await expect.element(
        screen.getByText("Loading...")
    ).toBeInTheDocument();
});

test("displays an error when dashboard data cannot be retrieved", async () => {

    vi.spyOn(api, "get")
        .mockRejectedValue(
            new Error("Failed to retrieve teacher dashboard data")
        );

    const screen = await render(
        <MemoryRouter>
            <TeacherDashboard />
        </MemoryRouter>
    );

    await expect.element(
        screen.getByText(
            "Failed to retrieve teacher dashboard data."
        )
    ).toBeInTheDocument();
});

test("requests teacher progress and dashboard data", async () => {

    const getMock = vi
        .spyOn(api, "get")
        .mockImplementation((url) => {

            if (url === "/courses/teaching/progress/") {
                return Promise.resolve({
                    data: mockTeacherProgress,
                });
            }

            if (url === "/courses/teaching/dashboard/") {
                return Promise.resolve({
                    data: mockTeacherCourses,
                });
            }

            return Promise.reject(
                new Error(`Unexpected URL: ${url}`)
            );
        });

    await render(
        <MemoryRouter>
            <TeacherDashboard />
        </MemoryRouter>
    );

    expect(getMock).toHaveBeenCalledWith(
        "/courses/teaching/progress/"
    );

    expect(getMock).toHaveBeenCalledWith(
        "/courses/teaching/dashboard/"
    );
});

test("displays the correct teacher overview statistics", async () => {

    vi.spyOn(api, "get")
        .mockImplementation((url) => {

            if (url === "/courses/teaching/progress/") {
                return Promise.resolve({
                    data: mockTeacherProgress,
                });
            }

            return Promise.resolve({
                data: mockTeacherCourses,
            });
        });

    const screen = await render(
        <MemoryRouter>
            <TeacherDashboard />
        </MemoryRouter>
    );

    await expect.element(
        screen.getByText("Courses Taught: 2")
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText("Total Students: 15")
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText("Awaiting Grading: 2")
    ).toBeInTheDocument();
});

test("renders the correct details for each course", async () => {

    vi.spyOn(api, "get")
        .mockImplementation((url) => {

            if (url === "/courses/teaching/progress/") {
                return Promise.resolve({
                    data: mockTeacherProgress,
                });
            }

            return Promise.resolve({
                data: mockTeacherCourses,
            });
        });

    const screen = await render(
        <MemoryRouter>
            <TeacherDashboard />
        </MemoryRouter>
    );

    const courses = screen.getByRole("listitem");

    const mathematics = courses.nth(0);
    const computerScience = courses.nth(1);

    // Mathematics
    await expect.element(
        mathematics.getByRole("heading", { level: 4 })
    ).toHaveTextContent("Mathematics (MATH101)");

    await expect.element(
        mathematics.getByText(/Status:/)
    ).toHaveTextContent("Status: Active");

    await expect.element(
        mathematics.getByText(/Total Students:/)
    ).toHaveTextContent("Total Students: 10");

    await expect.element(
        mathematics.getByText(/Active Students:/)
    ).toHaveTextContent("Active Students: 6");

    await expect.element(
        mathematics.getByText(/Completed Students:/)
    ).toHaveTextContent("Completed Students: 0");

    await expect.element(
        mathematics.getByText(/Dropped Students:/)
    ).toHaveTextContent("Dropped Students: 4");

    // Computer Science
    await expect.element(
        computerScience.getByRole("heading", { level: 4 })
    ).toHaveTextContent("Computer Science (CS101)");

    await expect.element(
        computerScience.getByText(/Status:/)
    ).toHaveTextContent("Status: Inactive");

    await expect.element(
        computerScience.getByText(/Total Students:/)
    ).toHaveTextContent("Total Students: 5");

    await expect.element(
        computerScience.getByText(/Active Students:/)
    ).toHaveTextContent("Active Students: 2");

    await expect.element(
        computerScience.getByText(/Completed Students:/)
    ).toHaveTextContent("Completed Students: 2");

    await expect.element(
        computerScience.getByText(/Dropped Students:/)
    ).toHaveTextContent("Dropped Students: 1");
});

test("displays the empty state when the teacher has no courses", async () => {

    vi.spyOn(api, "get")
        .mockImplementation((url) => {

            if (url === "/courses/teaching/progress/") {
                return Promise.resolve({
                    data: [],
                });
            }

            return Promise.resolve({
                data: [],
            });
        });

    const screen = await render(
        <MemoryRouter>
            <TeacherDashboard />
        </MemoryRouter>
    );

    await expect.element(
        screen.getByText(
            "You are not currently teaching any courses."
        )
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText("Courses Taught: 0")
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText("Total Students: 0")
    ).toBeInTheDocument();

    await expect.element(
        screen.getByText("Awaiting Grading: 0")
    ).toBeInTheDocument();
});

test("displays the correct awaiting grading count for each course", async () => {

    vi.spyOn(api, "get")
        .mockImplementation((url) => {

            if (url === "/courses/teaching/progress/") {
                return Promise.resolve({
                    data: mockTeacherProgress,
                });
            }

            return Promise.resolve({
                data: mockTeacherCourses,
            });
        });

    const screen = await render(
        <MemoryRouter>
            <TeacherDashboard />
        </MemoryRouter>
    );

    const awaitingGrading = screen.getByText(
        "Awaiting Grading: 1"
    );

    await expect.element(awaitingGrading.first())
        .toBeInTheDocument();
});

//test is broken, don't know how to fix
// test("displays the gradebook button when a course has students awaiting grading", async () => {

//     vi.spyOn(api, "get")
//         .mockImplementation((url) => {

//             if (url === "/courses/teaching/progress/") {
//                 return Promise.resolve({
//                     data: mockTeacherProgress,
//                 });
//             }

//             return Promise.resolve({
//                 data: mockTeacherCourses,
//             });
//         });

//     const screen = await render(
//         <MemoryRouter>
//             <TeacherDashboard />
//         </MemoryRouter>
//     );

//     await expect.element(
//         screen.getByRole(
//             "button",
//             { name: "Go to Gradebook" }
//         )
//     ).toBeInTheDocument();
// });
test("displays the gradebook button when a course has students awaiting grading", async () => {

    vi.spyOn(api, "get")
        .mockImplementation((url) => {

            if (url === "/courses/teaching/progress/") {
                return Promise.resolve({
                    data: mockTeacherProgress,
                });
            }

            return Promise.resolve({
                data: mockTeacherCourses,
            });
        });

    const screen = await render(
        <MemoryRouter>
            <TeacherDashboard />
        </MemoryRouter>
    );

    const courses = screen.getByRole("listitem");

    const mathematics = courses.nth(0);
    const computerScience = courses.nth(1);

    await expect.element(
        mathematics.getByRole(
            "button",
            { name: "Go to Gradebook" }
        )
    ).toBeInTheDocument();

    await expect.element(
        computerScience.getByRole(
            "button",
            { name: "Go to Gradebook" }
        )
    ).toBeInTheDocument();
});

test("does not display a gradebook button when nobody is awaiting grading", async () => {

    const gradedProgress = mockTeacherProgress.map(
        course => ({
            ...course,
            completed_students:
                course.completed_students.map(
                    student => ({
                        ...student,
                        grade: "A",
                    })
                ),
        })
    );

    vi.spyOn(api, "get")
        .mockImplementation((url) => {

            if (url === "/courses/teaching/progress/") {
                return Promise.resolve({
                    data: gradedProgress,
                });
            }

            return Promise.resolve({
                data: mockTeacherCourses,
            });
        });

    const screen = await render(
        <MemoryRouter>
            <TeacherDashboard />
        </MemoryRouter>
    );

    await expect.element(
        screen.getByRole(
            "button",
            { name: "Go to Gradebook" }
        )
    ).not.toBeInTheDocument();
});


test("navigates to the edit course page", async () => {

    vi.spyOn(api, "get")
        .mockImplementation((url) => {

            if (url === "/courses/teaching/progress/") {
                return Promise.resolve({
                    data: [],
                });
            }

            return Promise.resolve({
                data: [mockTeacherCourses[0]],
            });
        });

    const screen = await render(
        <MemoryRouter initialEntries={["/app/courses"]}>
            <Routes>

                <Route
                    path="/app/courses"
                    element={<TeacherDashboard />}
                />

                <Route
                    path="/app/courses/1/edit/"
                    element={
                        <h1>Edit Course Page</h1>
                    }
                />

            </Routes>
        </MemoryRouter>
    );

    await screen.getByRole(
        "button",
        { name: "Edit Course" }
    ).click();

    await expect.element(
        screen.getByRole(
            "heading",
            { name: "Edit Course Page" }
        )
    ).toBeInTheDocument();
});


test("navigates to the gradebook page", async () => {

    vi.spyOn(api, "get")
        .mockImplementation((url) => {

            if (url === "/courses/teaching/progress/") {
                return Promise.resolve({
                    data: [mockTeacherProgress[0]],
                });
            }

            return Promise.resolve({
                data: [mockTeacherCourses[0]],
            });
        });

    const screen = await render(
        <MemoryRouter initialEntries={["/app/courses"]}>
            <Routes>

                <Route
                    path="/app/courses"
                    element={<TeacherDashboard />}
                />

                <Route
                    path="/app/courses/progress/"
                    element={
                        <h1>Gradebook Page</h1>
                    }
                />

            </Routes>
        </MemoryRouter>
    );

    await screen.getByRole(
        "button",
        { name: "Go to Gradebook" }
    ).click();

    await expect.element(
        screen.getByRole(
            "heading",
            { name: "Gradebook Page" }
        )
    ).toBeInTheDocument();
});
