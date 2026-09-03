import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router-dom";

import NewCourse from "./NewCourse";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

const mockFields = [
    {
        name: "subject_name",
        widget: "text",
        required: true,
    },
    {
        name: "code",
        widget: "text",
        required: true,
    },
    {
        name: "description",
        widget: "textarea",
        required: false,
    },
    {
        name: "teacher",
        widget: "text",
        required: true,
    },
];

const mockTeacherOptions = [
    {
        id: 2,
        username: "teacherone",
    },
    {
        id: 3,
        username: "teachertwo",
    },
];

const mockTeacherResponse = {
    data: {
        fields: mockFields,
        role: "teacher",
        teacher_id: 2,
        teacher_options: mockTeacherOptions,
    },
};

const mockAdminResponse = {
    data: {
        fields: mockFields,
        role: "admin",
        teacher_id: null,
        teacher_options: mockTeacherOptions,
    },
};

const renderNewCourse = async () => {
    return render(
        <MemoryRouter>
            <NewCourse />
        </MemoryRouter>
    );
};

afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
});

describe("NewCourse", () => {

    test("fetches course fields when the page loads", async () => {
        api.get.mockResolvedValue({
            data: {
                fields: [],
                role: "teacher",
                teacher_id: 2,
                teacher_options: [],
            },
        });

        await renderNewCourse();

        expect(api.get).toHaveBeenCalledWith(
            "/courses/course-fields/"
        );
    });


    test("renders teacher form without teacher field", async () => {
        api.get.mockResolvedValue(mockTeacherResponse);

        const screen = await renderNewCourse();

        await expect.element(
            screen.getByRole("heading", {
                name: "New Course Page",
            })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByLabelText("subject_name")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByLabelText("code")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByLabelText("description")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByLabelText("teacher")
        ).not.toBeInTheDocument();
    });


    test("renders teacher dropdown for admin users", async () => {
        api.get.mockResolvedValue(mockAdminResponse);

        const screen = await renderNewCourse();

        const teacherSelect = screen.getByRole("combobox");

        await expect.element(
            teacherSelect
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("option", {
                name: "teacherone",
            })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("option", {
                name: "teachertwo",
            })
        ).toBeInTheDocument();
    });


    test("allows the user to enter course details", async () => {
        api.get.mockResolvedValue(mockAdminResponse);

        const screen = await renderNewCourse();

        const subjectInput = screen.getByLabelText("subject_name");
        const codeInput = screen.getByLabelText("code");
        const descriptionInput = screen.getByLabelText("description");
        const teacherSelect = screen.getByRole("combobox");

        await subjectInput.fill("Physics");
        await codeInput.fill("PHY101");
        await descriptionInput.fill("Introduction to physics");
        await teacherSelect.selectOptions("2");

        await expect.element(subjectInput).toHaveValue("Physics");
        await expect.element(codeInput).toHaveValue("PHY101");
        await expect.element(descriptionInput).toHaveValue(
            "Introduction to physics"
        );
        await expect.element(teacherSelect).toHaveValue("2");
    });


    test("successfully creates a course and displays success message", async () => {
        api.get.mockResolvedValue(mockAdminResponse);
        api.post.mockResolvedValue({
            data: {
                id: 10,
                subject_name: "Physics",
                code: "PHY101",
            },
        });

        const screen = await renderNewCourse();

        await screen.getByLabelText("subject_name").fill("Physics");
        await screen.getByLabelText("code").fill("PHY101");
        await screen.getByLabelText("description").fill(
            "Introduction to physics"
        );
        await screen.getByRole("combobox").selectOptions("2");

        await screen.getByRole("button", {
            name: "Submit",
        }).click();

        expect(api.post).toHaveBeenCalledWith(
            "/courses/create/",
            {
                subject_name: "Physics",
                code: "PHY101",
                description: "Introduction to physics",
                teacher: "2",
            }
        );

        await expect.element(
            screen.getByText("Course sucessfully created!")
        ).toBeInTheDocument();
    });


    test("resets teacher form while retaining teacher ID after successful creation", async () => {
        vi.useFakeTimers();

        api.get.mockResolvedValue(mockTeacherResponse);
        api.post.mockResolvedValue({
            data: {
                id: 10,
                subject_name: "Physics",
                code: "PHY101",
            },
        });

        const screen = await renderNewCourse();

        const subjectInput = screen.getByLabelText("subject_name");
        const codeInput = screen.getByLabelText("code");
        const descriptionInput = screen.getByLabelText("description");

        await subjectInput.fill("Physics");
        await codeInput.fill("PHY101");
        await descriptionInput.fill("Introduction to physics");

        await screen.getByRole("button", {
            name: "Submit",
        }).click();

        await expect.element(
            screen.getByText("Course sucessfully created!")
        ).toBeInTheDocument();

        vi.advanceTimersByTime(3000);

        await expect.element(subjectInput).toHaveValue("");
        await expect.element(codeInput).toHaveValue("");
        await expect.element(descriptionInput).toHaveValue("");

        expect(api.post).toHaveBeenCalledWith(
            "/courses/create/",
            expect.objectContaining({
                teacher: 2,
            })
        );
    });


    test("resets admin form completely after successful creation", async () => {
        vi.useFakeTimers();

        api.get.mockResolvedValue(mockAdminResponse);
        api.post.mockResolvedValue({
            data: {
                id: 10,
                subject_name: "Physics",
                code: "PHY101",
            },
        });

        const screen = await renderNewCourse();

        const subjectInput = screen.getByLabelText("subject_name");
        const codeInput = screen.getByLabelText("code");
        const descriptionInput = screen.getByLabelText("description");
        const teacherSelect = screen.getByRole("combobox");

        await subjectInput.fill("Physics");
        await codeInput.fill("PHY101");
        await descriptionInput.fill("Introduction to physics");
        await teacherSelect.selectOptions("2");

        await screen.getByRole("button", {
            name: "Submit",
        }).click();

        await expect.element(
            screen.getByText("Course sucessfully created!")
        ).toBeInTheDocument();

        vi.advanceTimersByTime(3000);

        await expect.element(subjectInput).toHaveValue("");
        await expect.element(codeInput).toHaveValue("");
        await expect.element(descriptionInput).toHaveValue("");
        await expect.element(teacherSelect).toHaveValue("");
    });

});