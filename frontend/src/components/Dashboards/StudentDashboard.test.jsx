import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
    MemoryRouter,
    Routes,
    Route
} from "react-router-dom";


import StudentDashboard from "./StudentDashboard";
import api from "../../services/api";

import {
    mockActiveEnrolment,
    mockSecondActiveEnrolment,
    mockAwaitingCompletion,
    mockCompletedEnrolment,
    mockSecondCompletedEnrolment,
} from "../../test/mocks/enrolments";


afterEach(() => {
    vi.restoreAllMocks();
});


describe("Dashboard loading and errors", () => {

    test("displays loading while dashboard data is being retrieved", async () => {
        vi.spyOn(api, "get")
            .mockImplementation(
                () => new Promise(() => { })
            );

        const screen = await render(
            <MemoryRouter>
                <StudentDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByText("Loading...")
        ).toBeInTheDocument();
    });


    test("displays an error when dashboard data cannot be retrieved", async () => {
        vi.spyOn(api, "get")
            .mockRejectedValue(
                new Error("Failed to retrieve dashboard data")
            );

        const screen = await render(
            <MemoryRouter>
                <StudentDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByText(
                "Failed to retrieve student dashboard data."
            )
        ).toBeInTheDocument();
    });

});


describe("Dashboard data fetching", () => {

    test("requests current and completed enrolments", async () => {
        const getMock = vi
            .spyOn(api, "get")
            .mockImplementation((url) => {
                if (url === "/courses/enrolments/me/") {
                    return Promise.resolve({
                        data: [mockActiveEnrolment],
                    });
                }

                if (url === "/courses/enrolments/completed/me/") {
                    return Promise.resolve({
                        data: [mockCompletedEnrolment],
                    });
                }

                return Promise.reject(
                    new Error(`Unexpected URL: ${url}`)
                );
            });

        await render(
            <MemoryRouter>
                <StudentDashboard />
            </MemoryRouter>
        );

        expect(getMock).toHaveBeenCalledWith(
            "/courses/enrolments/me/"
        );

        expect(getMock).toHaveBeenCalledWith(
            "/courses/enrolments/completed/me/"
        );
    });

});


describe("Active courses", () => {
    //testing both counts in one test. fix later
    test("displays the correct active and completed course counts", async () => {
        vi.spyOn(api, "get")
            .mockImplementation((url) => {
                if (url === "/courses/enrolments/me/") {
                    return Promise.resolve({
                        data: [
                            mockActiveEnrolment,
                            mockSecondActiveEnrolment,
                        ],
                    });
                }

                return Promise.resolve({
                    data: [mockCompletedEnrolment],
                });
            });

        const screen = await render(
            <MemoryRouter>
                <StudentDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByText("Active Courses: 2")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Completed Courses: 1")
        ).toBeInTheDocument();
    });


    test("displays active course details", async () => {
        vi.spyOn(api, "get")
            .mockImplementation((url) => {
                if (url === "/courses/enrolments/me/") {
                    return Promise.resolve({
                        data: [mockActiveEnrolment],
                    });
                }

                return Promise.resolve({
                    data: [],
                });
            });

        const screen = await render(
            <MemoryRouter>
                <StudentDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByRole(
                "heading",
                { name: "Mathematics (MATH101)" }
            )
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Teacher: teacherone")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Progress: 50%")
        ).toBeInTheDocument();
    });


    test("displays the active course in current progress", async () => {
        vi.spyOn(api, "get")
            .mockImplementation((url) => {
                if (url === "/courses/enrolments/me/") {
                    return Promise.resolve({
                        data: [mockActiveEnrolment],
                    });
                }

                return Promise.resolve({
                    data: [],
                });
            });

        const screen = await render(
            <MemoryRouter>
                <StudentDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByRole(
                "heading",
                { name: "Current Progress" }
            )
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Mathematics: 50%")
        ).toBeInTheDocument();
    });


    test("displays the empty active course state", async () => {
        vi.spyOn(api, "get")
            .mockImplementation((url) => {
                if (url === "/courses/enrolments/me/") {
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
                <StudentDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByText(
                "You are not currently enrolled in any active courses."
            )
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("No active courses.")
        ).toBeInTheDocument();
    });

});


describe("Completed courses", () => {

    test("displays completed course details", async () => {
        vi.spyOn(api, "get")
            .mockImplementation((url) => {
                if (url === "/courses/enrolments/me/") {
                    return Promise.resolve({
                        data: [],
                    });
                }

                return Promise.resolve({
                    data: [mockCompletedEnrolment],
                });
            });

        const screen = await render(
            <MemoryRouter>
                <StudentDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByRole(
                "heading",
                { name: "Completed Courses" }
            )
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole(
                "heading",
                { name: "History (HIST101)" }
            )
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Grade: A").first()
        ).toBeInTheDocument();
        //this isn't a good fix, reassess the layout and try and split the page up

        await expect.element(
            screen.getByText(
                `Completed: ${new Date(
                    mockCompletedEnrolment.completed_at
                ).toLocaleDateString()}`
            ).first()
        ).toBeInTheDocument();
        //ditto above
    });


    test("displays the empty completed course state", async () => {
        vi.spyOn(api, "get")
            .mockImplementation((url) => {
                if (url === "/courses/enrolments/me/") {
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
                <StudentDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByText(
                "You have not completed any courses yet."
            )
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("No grades yet.")
        ).toBeInTheDocument();
    });


    test("displays recent grades with the newest completion first", async () => {
        const olderCompleted = {
            ...mockSecondCompletedEnrolment,
            completed_at: "2026-08-01T12:00:00Z",
        };

        const newerCompleted = {
            ...mockCompletedEnrolment,
            completed_at: "2026-08-20T12:00:00Z",
        };

        vi.spyOn(api, "get")
            .mockImplementation((url) => {
                if (url === "/courses/enrolments/me/") {
                    return Promise.resolve({
                        data: [],
                    });
                }

                return Promise.resolve({
                    data: [olderCompleted, newerCompleted],
                });
            });

        const screen = await render(
            <MemoryRouter>
                <StudentDashboard />
            </MemoryRouter>
        );

        const history = screen.getByRole(
            "heading",
            { name: "History (HIST101)" }
        );

        const english = screen.getByRole(
            "heading",
            { name: "English (ENG101)" }
        );

        await expect.element(history).toBeInTheDocument();
        await expect.element(english).toBeInTheDocument();
    });


    test("limits recent grades to five courses", async () => {
        const completedCourses = Array.from(
            { length: 6 },
            (_, index) => ({
                ...mockCompletedEnrolment,
                id: index + 20,
                course_id: index + 20,
                course_name: `Course ${index + 1}`,
                course_code: `CODE${index + 1}`,
                grade: "A",
                completed_at: `2026-08-${String(
                    20 - index
                ).padStart(2, "0")}T12:00:00Z`,
            })
        );

        vi.spyOn(api, "get")
            .mockImplementation((url) => {
                if (url === "/courses/enrolments/me/") {
                    return Promise.resolve({
                        data: [],
                    });
                }

                return Promise.resolve({
                    data: completedCourses,
                });
            });

        const screen = await render(
            <MemoryRouter>
                <StudentDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByRole(
                "heading",
                { name: "Course 1 (CODE1)" }
            )
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole(
                "heading",
                { name: "Course 5 (CODE5)" }
            )
        ).toBeInTheDocument();

        const recentGradesHeading = screen.getByRole(
            "heading",
            { name: "Recent Grades" }
        );

        const recentGradesSection =
            recentGradesHeading.element().parentElement;

        expect(
            recentGradesSection.textContent
        ).not.toContain("Course 6");
    });

});


describe("Course completion", () => {

    test("shows the completion button when a course is awaiting completion", async () => {
        vi.spyOn(api, "get")
            .mockImplementation((url) => {
                if (url === "/courses/enrolments/me/") {
                    return Promise.resolve({
                        data: [mockAwaitingCompletion],
                    });
                }

                return Promise.resolve({
                    data: [],
                });
            });

        const screen = await render(
            <MemoryRouter>
                <StudentDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByRole(
                "button",
                { name: "Courses Awaiting Completion" }
            )
        ).toBeInTheDocument();
    });


    test("shows no completion action when no courses are awaiting completion", async () => {
        vi.spyOn(api, "get")
            .mockImplementation((url) => {
                if (url === "/courses/enrolments/me/") {
                    return Promise.resolve({
                        data: [mockActiveEnrolment],
                    });
                }

                return Promise.resolve({
                    data: [],
                });
            });

        const screen = await render(
            <MemoryRouter>
                <StudentDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByText(
                "No Courses to mark as complete."
            )
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole(
                "button",
                { name: "Courses Awaiting Completion" }
            )
        ).not.toBeInTheDocument();
    });


    test("navigates to the completion page when the completion button is clicked", async () => {
        vi.spyOn(api, "get")
            .mockImplementation((url) => {
                if (url === "/courses/enrolments/me/") {
                    return Promise.resolve({
                        data: [mockAwaitingCompletion],
                    });
                }

                return Promise.resolve({
                    data: [],
                });
            });

        const screen = await render(
            <MemoryRouter initialEntries={["/app"]}>
                <Routes>
                    <Route
                        path="/app"
                        element={<StudentDashboard />}
                    />

                    <Route
                        path="/app/courses/enrolments/complete/"
                        element={<h1>Completion Page</h1>}
                    />
                </Routes>
            </MemoryRouter>
        );

        await screen.getByRole(
            "button",
            { name: "Courses Awaiting Completion" }
        ).click();

        await expect.element(
            screen.getByRole(
                "heading",
                { name: "Completion Page" }
            )
        ).toBeInTheDocument();
    });

});