import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router-dom";

import History from "./History";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

vi.mock("../../services/api", () => ({
    default: {
        get: vi.fn(),
    },
}));

vi.mock("../../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));

const mockRecords = [
    {
        id: 1,
        student_username: "studentone",
        student_first_name: "Student",
        student_last_name: "One",
        teacher_username: "teacherone",
        teacher_first_name: "Teacher",
        teacher_last_name: "One",
        course_id: 1,
        course_code: "MATH101",
        course_name: "Mathematics",
        grade: "A",
    },
    {
        id: 2,
        student_username: "studenttwo",
        student_first_name: "Student",
        student_last_name: "Two",
        teacher_username: "teachertwo",
        teacher_first_name: "Teacher",
        teacher_last_name: "Two",
        course_id: 2,
        course_code: "CS101",
        course_name: "Computer Science",
        grade: "B",
    },
    {
        id: 3,
        student_username: "studentone",
        student_first_name: "Student",
        student_last_name: "One",
        teacher_username: "teachertwo",
        teacher_first_name: "Teacher",
        teacher_last_name: "Two",
        course_id: 2,
        course_code: "CS101",
        course_name: "Computer Science",
        grade: "C",
    },
];

const renderHistory = async (role = "admin") => {
    useAuth.mockReturnValue({
        user: { role },
    });

    return render(
        <MemoryRouter>
            <History />
        </MemoryRouter>
    );
};

afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
});

describe("History", () => {

    test("shows loading state while history is being retrieved", async () => {
        api.get.mockReturnValue(new Promise(() => { }));

        const screen = await renderHistory();

        await expect.element(
            screen.getByText("Loading...")
        ).toBeInTheDocument();

        expect(api.get).toHaveBeenCalledWith(
            "/courses/enrolments/history/"
        );
    });


    test("displays the retrieved history records", async () => {
        api.get.mockResolvedValue({
            data: mockRecords,
        });

        const screen = await renderHistory();

        await expect.element(
            screen.getByRole("heading", { name: "Course History" })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("heading", { name: "Mathematics" })
        ).toBeInTheDocument();

        const computerScience = screen.getByRole(
            "heading",
            { name: "Computer Science" }
        );

        await expect.element(computerScience.first()).toBeInTheDocument();
        await expect.element(computerScience.nth(1)).toBeInTheDocument();
    });


    test("displays an error when history cannot be retrieved", async () => {
        api.get.mockRejectedValue(
            new Error("Request failed")
        );

        const screen = await renderHistory();

        await expect.element(
            screen.getByText("Failed to retrieve course history.")
        ).toBeInTheDocument();
    });


    test("shows My Course History for teachers", async () => {
        api.get.mockResolvedValue({
            data: mockRecords,
        });

        const screen = await renderHistory("teacher");

        await expect.element(
            screen.getByRole("heading", {
                name: "My Course History",
            })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("heading", {
                name: "Course History",
                exact: true,
            })
        ).not.toBeInTheDocument();
    });


    test("shows Course History and teacher filter for admins", async () => {
        api.get.mockResolvedValue({
            data: mockRecords,
        });

        const screen = await renderHistory("admin");

        await expect.element(
            screen.getByRole("heading", {
                name: "Course History",
            })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByLabelText("Teacher:")
        ).toBeInTheDocument();
    });


    test("filters records using the search field", async () => {
        api.get.mockResolvedValue({
            data: mockRecords,
        });

        const screen = await renderHistory();

        const search = screen.getByPlaceholder("Search history...");

        await search.fill("studenttwo");

        await expect.element(
            screen.getByText("Student: Student Two")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Student: Student One")
        ).not.toBeInTheDocument();
    });


    test("filters records by student", async () => {
        api.get.mockResolvedValue({
            data: mockRecords,
        });

        const screen = await renderHistory();

        const studentFilter = screen.getByLabelText("Student:");

        await studentFilter.selectOptions("studenttwo");

        await expect.element(
            screen.getByText("Student: Student Two")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Student: Student One")
        ).not.toBeInTheDocument();
    });


    test("filters records by teacher for admins", async () => {
        api.get.mockResolvedValue({
            data: mockRecords,
        });

        const screen = await renderHistory();

        const teacherFilter = screen.getByLabelText("Teacher:");

        await teacherFilter.selectOptions("teacherone");

        await expect.element(
            screen.getByText("Teacher: teacherone")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Teacher: teachertwo")
        ).not.toBeInTheDocument();
    });

    test("filters records by course", async () => {
        api.get.mockResolvedValue({
            data: mockRecords,
        });

        const screen = await renderHistory();

        const courseFilter = screen.getByLabelText("Course:");

        await courseFilter.selectOptions("1");

        await expect.element(
            screen.getByRole("heading", { name: "Mathematics" })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("heading", { name: "Computer Science" })
        ).not.toBeInTheDocument();
    });


    test("filters records by grade", async () => {
        api.get.mockResolvedValue({
            data: mockRecords,
        });

        const screen = await renderHistory();

        const gradeFilter = screen.getByLabelText("Grade:");

        await gradeFilter.selectOptions("A");

        await expect.element(
            screen.getByRole("heading", { name: "Mathematics" })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("heading", { name: "Computer Science" })
        ).not.toBeInTheDocument();
    });


    test("shows empty state when there are no history records", async () => {
        api.get.mockResolvedValue({
            data: [],
        });

        const screen = await renderHistory();

        await expect.element(
            screen.getByText("No completed courses found.")
        ).toBeInTheDocument();
    });


    test("shows no-match state when filters exclude all records", async () => {
        api.get.mockResolvedValue({
            data: mockRecords,
        });

        const screen = await renderHistory();

        const studentFilter = screen.getByLabelText("Student:");
        const courseFilter = screen.getByLabelText("Course:");

        await studentFilter.selectOptions("studenttwo");
        await courseFilter.selectOptions("1");

        await expect.element(
            screen.getByText("No records match your current filters.")
        ).toBeInTheDocument();
    });


    test("clears all filters", async () => {
        api.get.mockResolvedValue({
            data: mockRecords,
        });

        const screen = await renderHistory();

        const search = screen.getByPlaceholder(
            "Search history..."
        );
        const studentFilter = screen.getByLabelText("Student:");
        const courseFilter = screen.getByLabelText("Course:");
        const gradeFilter = screen.getByLabelText("Grade:");

        await search.fill("studenttwo");
        await studentFilter.selectOptions("studenttwo");
        await courseFilter.selectOptions("2");
        await gradeFilter.selectOptions("B");

        await screen.getByRole(
            "button",
            { name: "Clear Filters" }
        ).click();

        await expect.element(search).toHaveValue("");
        await expect.element(studentFilter).toHaveValue("");
        await expect.element(courseFilter).toHaveValue("");
        await expect.element(gradeFilter).toHaveValue("");

        await expect.element(
            screen.getByText("studentone")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("studenttwo")
        ).toBeInTheDocument();
    });
});