import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
    MemoryRouter,
    Route,
    Routes,
} from "react-router-dom";

import EditCourse from "./EditCourse";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const mockTeacher = {
    id: 1,
    username: "testteacher",
    role: "teacher",
};

const mockAdmin = {
    id: 2,
    username: "testadmin",
    role: "admin",
};

const mockCourse = {
    id: 5,
    subject_name: "Mathematics",
    code: "MATH101",
    description: "A mathematics course",
    teacher: 1,
};

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
        widget: "number",
        required: true,
    },
];

const mockTeacherOptions = [
    {
        id: 1,
        username: "teacherone",
    },
    {
        id: 2,
        username: "teachertwo",
    },
];

vi.mock("../../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../services/api", () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn(),
    },
}));

const renderEditCourse = async (role = "teacher") => {
    useAuth.mockReturnValue({
        user: role === "admin" ? mockAdmin : mockTeacher,
    });

    return render(
        <MemoryRouter initialEntries={["/app/courses/5/edit"]}>
            <Routes>
                <Route
                    path="/app/courses/:id/edit"
                    element={<EditCourse />}
                />
            </Routes>
        </MemoryRouter>
    );
};

afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
});


describe("EditCourse", () => {

    test("shows loading while course data is being fetched", async () => {
        api.get.mockReturnValue(new Promise(() => { }));

        const screen = await renderEditCourse();

        await expect.element(
            screen.getByText("Loading...")
        ).toBeInTheDocument();
    });


    test("fetches the course and form fields", async () => {
        api.get
            .mockResolvedValueOnce({
                data: mockCourse,
            })
            .mockResolvedValueOnce({
                data: {
                    fields: mockFields,
                    teacher_options: mockTeacherOptions,
                },
            });

        const screen = await renderEditCourse();

        await expect.element(
            screen.getByText("Editing Course: 5")
        ).toBeInTheDocument();

        expect(api.get).toHaveBeenCalledWith(
            "/courses/5/"
        );

        expect(api.get).toHaveBeenCalledWith(
            "/courses/course-fields"
        );
    });


    test("renders the course fields with existing values", async () => {
        api.get
            .mockResolvedValueOnce({
                data: mockCourse,
            })
            .mockResolvedValueOnce({
                data: {
                    fields: mockFields,
                    teacher_options: mockTeacherOptions,
                },
            });

        const screen = await renderEditCourse();

        const subjectInput = screen.getByRole(
            "textbox",
            { name: "subject_name" }
        );

        const codeInput = screen.getByRole(
            "textbox",
            { name: "code" }
        );

        const descriptionInput = screen.getByRole(
            "textbox",
            { name: "description" }
        );

        await expect.element(subjectInput).toHaveValue("Mathematics");
        await expect.element(codeInput).toHaveValue("MATH101");
        await expect.element(descriptionInput).toHaveValue(
            "A mathematics course"
        );
    });


    test("does not render the teacher field for a teacher", async () => {
        api.get
            .mockResolvedValueOnce({
                data: mockCourse,
            })
            .mockResolvedValueOnce({
                data: {
                    fields: mockFields,
                    teacher_options: mockTeacherOptions,
                },
            });

        const screen = await renderEditCourse("teacher");

        await expect.element(
            screen.getByRole("textbox", { name: "subject_name" })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("combobox", { name: "teacher" })
        ).not.toBeInTheDocument();
    });


    test("renders teacher options for an admin", async () => {
        api.get
            .mockResolvedValueOnce({
                data: mockCourse,
            })
            .mockResolvedValueOnce({
                data: {
                    fields: mockFields,
                    teacher_options: mockTeacherOptions,
                },
            });

        const screen = await renderEditCourse("admin");

        const teacherSelect = screen.getByRole(
            "combobox",
            { name: "teacher" }
        );

        await expect.element(
            teacherSelect
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("teacherone")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("teachertwo")
        ).toBeInTheDocument();
    });


    test("updates a field and submits the edited course", async () => {
        api.get
            .mockResolvedValueOnce({
                data: mockCourse,
            })
            .mockResolvedValueOnce({
                data: {
                    fields: mockFields,
                    teacher_options: mockTeacherOptions,
                },
            });

        const updatedCourse = {
            ...mockCourse,
            subject_name: "Advanced Mathematics",
        };

        api.patch.mockResolvedValue({
            data: updatedCourse,
        });

        const screen = await renderEditCourse("teacher");

        const subjectInput = screen.getByRole(
            "textbox",
            { name: "subject_name" }
        );

        await subjectInput.fill("Advanced Mathematics");

        await screen.getByRole(
            "button",
            { name: "Save changes" }
        ).click();

        expect(api.patch).toHaveBeenCalledWith(
            "/courses/5/edit/",
            {
                ...mockCourse,
                subject_name: "Advanced Mathematics",
            }
        );

        await expect.element(
            screen.getByText("Course updated successfully!")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("button", { name: "Saved!" })
        ).toBeDisabled();
    });


    test("shows an error when loading the course fails", async () => {
        api.get
            .mockRejectedValueOnce(
                new Error("Failed to load course")
            )
            .mockResolvedValueOnce({
                data: {
                    fields: mockFields,
                    teacher_options: mockTeacherOptions,
                },
            });

        const screen = await renderEditCourse();

        await expect.element(
            screen.getByText("Failed to load course")
        ).toBeInTheDocument();
    });


    test("shows an error when the update fails", async () => {
        api.get
            .mockResolvedValueOnce({
                data: mockCourse,
            })
            .mockResolvedValueOnce({
                data: {
                    fields: mockFields,
                    teacher_options: mockTeacherOptions,
                },
            });

        api.patch.mockRejectedValue(
            new Error("Failed to update course")
        );

        const screen = await renderEditCourse();

        await screen.getByRole(
            "button",
            { name: "Save changes" }
        ).click();

        await expect.element(
            screen.getByText("Failed to update course")
        ).toBeInTheDocument();
    });

});