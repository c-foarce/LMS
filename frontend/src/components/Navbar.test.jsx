import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Navbar";

import {
    mockStudent,
    mockTeacher,
    mockAdmin,
} from "../test/mocks/auth";

const mockUseAuth = vi.fn();
const mockSetUser = vi.fn();

vi.mock("../context/AuthContext", () => ({
    useAuth: () => mockUseAuth(),
}));

afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
});

const renderNavbar = async (user) => {
    mockUseAuth.mockReturnValue({
        user,
        setUser: mockSetUser,
    });

    localStorage.setItem("access", "test-access-token");

    return render(
        <MemoryRouter>
            <Navbar />
        </MemoryRouter>
    );
};

describe("Navbar", () => {

    test("renders correct navigation for a student", async () => {
        const screen = await renderNavbar(mockStudent);

        const home = screen.getByRole("link", { name: "Student Home" });
        const courses = screen.getByRole("link", { name: "My Courses" });
        const grades = screen.getByRole("link", { name: "My Grades" });
        const courseList = screen.getByRole("link", { name: "Course List" });
        const completion = screen.getByRole("link", { name: "Completion" });

        await expect.element(home).toHaveAttribute(
            "href",
            "/app/dashboard/"
        );

        await expect.element(courses).toHaveAttribute(
            "href",
            "/app/courses/"
        );

        await expect.element(grades).toHaveAttribute(
            "href",
            "/app/courses/grades"
        );

        await expect.element(courseList).toHaveAttribute(
            "href",
            "/app/courses/all/"
        );

        await expect.element(completion).toHaveAttribute(
            "href",
            "/app/courses/enrolments/complete/"
        );

        await expect.element(
            screen.getByRole("button", { name: "Logout" })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("link", { name: "New Course" })
        ).not.toBeInTheDocument();

        await expect.element(
            screen.getByRole("link", { name: "Grading" })
        ).not.toBeInTheDocument();

        await expect.element(
            screen.getByRole("link", { name: "New User" })
        ).not.toBeInTheDocument();

        await expect.element(
            screen.getByRole("link", { name: "User List" })
        ).not.toBeInTheDocument();

        await expect.element(
            screen.getByRole("link", { name: "Enrolments List" })
        ).not.toBeInTheDocument();
    });


    test("renders correct navigation for a teacher", async () => {
        const screen = await renderNavbar(mockTeacher);

        const home = screen.getByRole(
            "link",
            { name: "Teacher Home" }
        );

        const courses = screen.getByRole(
            "link",
            { name: "My Courses" }
        );

        const newCourse = screen.getByRole(
            "link",
            { name: "New Course" }
        );

        const grading = screen.getByRole(
            "link",
            { name: "Grading" }
        );

        const newEnrolment = screen.getByRole(
            "link",
            { name: "New Enrolment" }
        );
        const history = screen.getByRole(
            "link",
            { name: "My History" }
        );



        await expect.element(home).toHaveAttribute(
            "href",
            "/app/dashboard/"
        );

        await expect.element(courses).toHaveAttribute(
            "href",
            "/app/courses/"
        );

        await expect.element(newCourse).toHaveAttribute(
            "href",
            "/app/courses/new/"
        );

        await expect.element(grading).toHaveAttribute(
            "href",
            "/app/courses/progress/"
        );

        await expect.element(newEnrolment).toHaveAttribute(
            "href",
            "/app/courses/enrolments/new/"
        );

        await expect.element(history).toHaveAttribute(
            "href",
            "/app/courses/enrolments/history/"
        );

        await expect.element(
            screen.getByRole(
                "button",
                { name: "Logout" })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole(
                "link",
                { name: "My Grades" })
        ).not.toBeInTheDocument();

        await expect.element(
            screen.getByRole(
                "link",
                { name: "New User" })
        ).not.toBeInTheDocument();

        await expect.element(
            screen.getByRole(
                "link",
                { name: "User List" })
        ).not.toBeInTheDocument();

        await expect.element(
            screen.getByRole(
                "link",
                { name: "Enrolments List" })
        ).not.toBeInTheDocument();

        await expect.element(
            screen.getByRole(
                "link",
                { name: "Course List" })
        ).not.toBeInTheDocument();
    });


    test("renders correct navigation for an admin", async () => {
        const screen = await renderNavbar(mockAdmin);

        const home = screen.getByRole("link", { name: "Admin Home" });
        const newCourse = screen.getByRole("link", { name: "New Course" });
        const newUser = screen.getByRole("link", { name: "New User" });
        const newEnrolment = screen.getByRole(
            "link",
            { name: "New Enrolment" }
        );
        const enrolmentsList = screen.getByRole(
            "link",
            { name: "Enrolments List" }
        );
        const userList = screen.getByRole(
            "link",
            { name: "User List" }
        );
        const courseList = screen.getByRole(
            "link",
            { name: "Course List" }
        );
        const history = screen.getByRole(
            "link",
            { name: "History" }
        );

        await expect.element(home).toHaveAttribute(
            "href",
            "/app/dashboard/"
        );

        await expect.element(newCourse).toHaveAttribute(
            "href",
            "/app/courses/new/"
        );

        await expect.element(newUser).toHaveAttribute(
            "href",
            "/app/accounts/new/"
        );

        await expect.element(newEnrolment).toHaveAttribute(
            "href",
            "/app/courses/enrolments/new/"
        );

        await expect.element(enrolmentsList).toHaveAttribute(
            "href",
            "/app/courses/enrolments/all/"
        );

        await expect.element(userList).toHaveAttribute(
            "href",
            "/app/accounts/all/"
        );

        await expect.element(courseList).toHaveAttribute(
            "href",
            "/app/courses/all/"
        );

        await expect.element(history).toHaveAttribute(
            "href",
            "/app/courses/enrolments/history/"
        );

        await expect.element(
            screen.getByRole("button", { name: "Logout" })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("link", { name: "My Courses" })
        ).not.toBeInTheDocument();

        await expect.element(
            screen.getByRole("link", { name: "My Grades" })
        ).not.toBeInTheDocument();

        await expect.element(
            screen.getByRole("link", { name: "Grading" })
        ).not.toBeInTheDocument();

        await expect.element(
            screen.getByRole("link", { name: "Completion" })
        ).not.toBeInTheDocument();
    });


    // test("logs out the user and navigates to the home page", async () => {
    //     // This test needs actual routes so we can see where navigate("/") goes.

    //     const screen = await render(
    //         <MemoryRouter initialEntries={["/app/dashboard/"]}>
    //             <Navbar />
    //         </MemoryRouter>
    //     );

    //     // Navbar needs a user for roleName.
    //     mockUseAuth.mockReturnValue({
    //         user: mockStudent,
    //         setUser: mockSetUser,
    //     });

    //     localStorage.setItem("access", "test-access-token");
    //     localStorage.setItem("refresh", "test-refresh-token");

    //     await screen.getByRole(
    //         "button",
    //         { name: "Logout" }
    //     ).click();

    //     expect(localStorage.getItem("access")).toBeNull();
    //     expect(localStorage.getItem("refresh")).toBeNull();

    //     expect(mockSetUser).toHaveBeenCalledWith(null);
    // });

    test("logs out the user", async () => {
        const screen = await renderNavbar(mockStudent);

        localStorage.setItem("refresh", "test-refresh-token");

        await screen.getByRole("button", { name: "Logout" }).click();

        expect(localStorage.getItem("access")).toBeNull();
        expect(localStorage.getItem("refresh")).toBeNull();

        expect(mockSetUser).toHaveBeenCalledWith(null);
    });

    test("navigates to the home page when the user logs out", async () => {
        mockUseAuth.mockReturnValue({
            user: mockStudent,
            setUser: mockSetUser,
        });

        localStorage.setItem("access", "test-access-token");
        localStorage.setItem("refresh", "test-refresh-token");

        const screen = await render(
            <MemoryRouter initialEntries={["/app/dashboard/"]}>
                <Routes>
                    <Route
                        path="/app/dashboard/"
                        element={<Navbar />}
                    />

                    <Route
                        path="/"
                        element={<h1>Welcome Page</h1>}
                    />
                </Routes>
            </MemoryRouter>
        );

        await screen.getByRole(
            "button",
            { name: "Logout" }
        ).click();

        await expect.element(
            screen.getByRole("heading", { name: "Welcome Page" })
        ).toBeInTheDocument();
    });
});