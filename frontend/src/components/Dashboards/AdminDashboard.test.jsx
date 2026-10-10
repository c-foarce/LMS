import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
    MemoryRouter,
    Routes,
    Route,
} from "react-router-dom";

import AdminDashboard from "./AdminDashboard";
import api from "../../services/api";

import {
    mockAdminUsers,
    mockAdminCourses,
    mockAdminEnrolments,
} from "../../test/mocks/dashboard";


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
                <AdminDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByText("Loading...", { exact: true })
        ).toBeInTheDocument();
    });


    test("displays an error when dashboard data cannot be retrieved", async () => {
        vi.spyOn(api, "get")
            .mockRejectedValue(
                new Error("Failed to retrieve dashboard data")
            );

        const screen = await render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByText(
                "Failed to retrieve dashboard data.", { exact: true }
            )
        ).toBeInTheDocument();
    });

});


describe("Dashboard data fetching", () => {

    test("requests users, courses and enrolments", async () => {
        const getMock = vi
            .spyOn(api, "get")
            .mockImplementation((url) => {

                if (url === "/accounts/all/") {
                    return Promise.resolve({
                        data: mockAdminUsers,
                    });
                }

                if (url === "/courses/list/") {
                    return Promise.resolve({
                        data: mockAdminCourses,
                    });
                }

                if (url === "/courses/enrolments/all/") {
                    return Promise.resolve({
                        data: mockAdminEnrolments,
                    });
                }

                return Promise.reject(
                    new Error(`Unexpected URL: ${url}`)
                );
            });

        await render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        expect(getMock).toHaveBeenCalledWith(
            "/accounts/all/"
        );

        expect(getMock).toHaveBeenCalledWith(
            "/courses/list/"
        );

        expect(getMock).toHaveBeenCalledWith(
            "/courses/enrolments/all/"
        );
    });

});


describe("System overview", () => {

    test("displays the system overview", async () => {
        vi.spyOn(api, "get")
            .mockImplementation((url) => {

                if (url === "/accounts/all/") {
                    return Promise.resolve({
                        data: mockAdminUsers,
                    });
                }

                if (url === "/courses/list/") {
                    return Promise.resolve({
                        data: mockAdminCourses,
                    });
                }

                return Promise.resolve({
                    data: mockAdminEnrolments,
                });
            });

        const screen = await render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByRole(
                "heading",
                { name: "System Overview" }
            )
        ).toBeInTheDocument();
    });


    test("displays the correct user counts", async () => {
        vi.spyOn(api, "get")
            .mockImplementation((url) => {

                if (url === "/accounts/all/") {
                    return Promise.resolve({
                        data: mockAdminUsers,
                    });
                }

                if (url === "/courses/list/") {
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
                <AdminDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByRole("heading", { name: "Students" })
        ).toBeVisible();

        await expect.element(
            screen.getByRole("heading", { name: "Teachers" })
        ).toBeVisible();

        await expect.element(
            screen.getByRole("heading", { name: "Admins" })
        ).toBeVisible();

        await expect.element(
            screen.getByText("1", { exact: true }).nth(0)
        ).toBeVisible();

        await expect.element(
            screen.getByText("1", { exact: true }).nth(1)
        ).toBeVisible();

        await expect.element(
            screen.getByText("1", { exact: true }).nth(2)
        ).toBeVisible();

        await expect.element(
            screen.getByText("3", { exact: true })
        ).toBeVisible();
    });


    test("displays the correct course counts", async () => {
        vi.spyOn(api, "get")
            .mockImplementation((url) => {

                if (url === "/accounts/all/") {
                    return Promise.resolve({
                        data: [],
                    });
                }

                if (url === "/courses/list/") {
                    return Promise.resolve({
                        data: mockAdminCourses,
                    });
                }

                return Promise.resolve({
                    data: [],
                });
            });

        const screen = await render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        screen.getByRole("heading", {
            name: "Active Courses",
            exact: true
        })

        await expect.element(
            screen.getByRole("heading", { name: "Inactive Courses" })
        ).toBeVisible();

        await expect.element(
            screen.getByText("1", { exact: true }).nth(0)
        ).toBeVisible();

        await expect.element(
            screen.getByText("1", { exact: true }).nth(1)
        ).toBeVisible();

        await expect.element(
            screen.getByText("2", { exact: true })
        ).toBeVisible();
    });


    test("displays the correct enrolment counts", async () => {
        vi.spyOn(api, "get")
            .mockImplementation((url) => {

                if (url === "/accounts/all/") {
                    return Promise.resolve({
                        data: [],
                    });
                }

                if (url === "/courses/list/") {
                    return Promise.resolve({
                        data: [],
                    });
                }

                return Promise.resolve({
                    data: mockAdminEnrolments,
                });
            });

        const screen = await render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByRole("heading", { name: "Active Enrolments" })
        ).toBeVisible();

        await expect.element(
            screen.getByRole("heading", { name: "Completed Enrolments" })
        ).toBeVisible();

        await expect.element(
            screen.getByText("2", { exact: true })
        ).toBeVisible();

        await expect.element(
            screen.getByText("1", { exact: true })
        ).toBeVisible();

        await expect.element(
            screen.getByText("3", { exact: true })
        ).toBeVisible();
    });

});


describe("Administrative attention", () => {

    test("displays no issues when there are no administrative issues", async () => {
        vi.spyOn(api, "get")
            .mockImplementation((url) => {

                if (url === "/accounts/all/") {
                    return Promise.resolve({
                        data: mockAdminUsers,
                    });
                }

                if (url === "/courses/list/") {
                    return Promise.resolve({
                        data: mockAdminCourses,
                    });
                }

                return Promise.resolve({
                    data: mockAdminEnrolments,
                });
            });

        const screen = await render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByRole(
                "heading",
                { name: "Administrative Attention" }
            )
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText(
                "No issues requiring attention.", { exact: true }
            )
        ).toBeInTheDocument();
    });


    test("displays courses without an assigned teacher", async () => {
        const coursesWithMissingTeacher = [
            ...mockAdminCourses,
            {
                id: 3,
                subject_name: "Physics",
                code: "PHY101",
                is_active: true,
                teacher_name: null,
                total_submissions: 4,
            },
        ];

        vi.spyOn(api, "get")
            .mockImplementation((url) => {

                if (url === "/accounts/all/") {
                    return Promise.resolve({
                        data: mockAdminUsers,
                    });
                }

                if (url === "/courses/list/") {
                    return Promise.resolve({
                        data: coursesWithMissingTeacher,
                    });
                }

                return Promise.resolve({
                    data: mockAdminEnrolments,
                });
            });

        const screen = await render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByRole(
                "heading",
                { name: "Courses without an assigned teacher" }
            )
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Physics (PHY101)", { exact: true })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("button", { name: "Edit" })
        ).toBeVisible();
    });


    test("navigates to the course edit page when Edit Course is clicked", async () => {
        const coursesWithMissingTeacher = [
            {
                id: 3,
                subject_name: "Physics",
                code: "PHY101",
                is_active: true,
                teacher_name: null,
                total_submissions: 4,
            },
        ];

        vi.spyOn(api, "get")
            .mockImplementation((url) => {

                if (url === "/accounts/all/") {
                    return Promise.resolve({
                        data: mockAdminUsers,
                    });
                }

                if (url === "/courses/list/") {
                    return Promise.resolve({
                        data: coursesWithMissingTeacher,
                    });
                }

                return Promise.resolve({
                    data: mockAdminEnrolments,
                });
            });

        const screen = await render(
            <MemoryRouter initialEntries={["/app"]}>
                <Routes>
                    <Route
                        path="/app"
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="/app/courses/3/edit/"
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


    test("displays users with missing information", async () => {
        const usersWithMissingInfo = [
            ...mockAdminUsers,
            {
                id: 4,
                username: "incompleteuser",
                first_name: "",
                last_name: "User",
                email: "",
                role: "student",
            },
        ];

        vi.spyOn(api, "get")
            .mockImplementation((url) => {

                if (url === "/accounts/all/") {
                    return Promise.resolve({
                        data: usersWithMissingInfo,
                    });
                }

                if (url === "/courses/list/") {
                    return Promise.resolve({
                        data: mockAdminCourses,
                    });
                }

                return Promise.resolve({
                    data: mockAdminEnrolments,
                });
            });

        const screen = await render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByRole(
                "heading",
                { name: "Users with missing information" }
            )
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("heading", { name: "incompleteuser" })
        ).toBeVisible();

        await expect.element(
            screen.getByText("Missing information:", { exact: true })
        ).toBeVisible();

        await expect.element(
            screen.getByText("first name", { exact: true })
        ).toBeVisible();

        await expect.element(
            screen.getByText("email", { exact: true })
        ).toBeVisible();

        await expect.element(
            screen.getByRole("button", { name: "Edit" })
        ).toBeVisible();
    });


    test("navigates to the user edit page when Edit is clicked", async () => {
        const usersWithMissingInfo = [
            {
                id: 4,
                username: "incompleteuser",
                first_name: "",
                last_name: "User",
                email: "",
                role: "student",
            },
        ];

        vi.spyOn(api, "get")
            .mockImplementation((url) => {

                if (url === "/accounts/all/") {
                    return Promise.resolve({
                        data: usersWithMissingInfo,
                    });
                }

                if (url === "/courses/list/") {
                    return Promise.resolve({
                        data: [],
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
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="/app/accounts/4/edit/"
                        element={<h1>Edit User Page</h1>}
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
                { name: "Edit User Page" }
            )
        ).toBeInTheDocument();
    });

});