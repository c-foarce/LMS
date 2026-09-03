import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import Completion from "./Completion";

import api from "../../services/api";

vi.mock("../../services/api", () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn(),
        post: vi.fn(),
    },
}));

afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
});


describe("Completion", () => {

    test("shows loading while courses are being fetched", async () => {
        api.get.mockReturnValue(new Promise(() => { }));

        const screen = await render(<Completion />);

        await expect.element(
            screen.getByText("Loading...")
        ).toBeInTheDocument();
    });


    test("displays completed courses awaiting acknowledgement", async () => {
        api.get.mockResolvedValue({
            data: [
                {
                    id: 1,
                    course_name: "Mathematics",
                    course_code: "MATH101",
                    teacher: "testteacher",
                    progress: 100,
                    grade: "A",
                },
                {
                    id: 2,
                    course_name: "Computer Science",
                    course_code: "CS101",
                    teacher: "teacher2",
                    progress: 75,
                    grade: "B",
                },
                {
                    id: 3,
                    course_name: "Physics",
                    course_code: "PHY101",
                    teacher: "teacher3",
                    progress: 100,
                    grade: null,
                },
            ],
        });

        const screen = await render(<Completion />);

        await expect.element(
            screen.getByRole("heading", { name: "Mathematics" })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Code: MATH101")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText("Grade: A")
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("heading", { name: "Computer Science" })
        ).not.toBeInTheDocument();

        await expect.element(
            screen.getByRole("heading", { name: "Physics" })
        ).not.toBeInTheDocument();
    });


    test("shows the empty state when there are no completed courses", async () => {
        api.get.mockResolvedValue({
            data: [],
        });

        const screen = await render(<Completion />);

        await expect.element(
            screen.getByText(
                "You have no courses awaiting completion."
            )
        ).toBeInTheDocument();
    });


    test("acknowledges and archives a completed course", async () => {
        api.get.mockResolvedValue({
            data: [
                {
                    id: 1,
                    course_name: "Mathematics",
                    course_code: "MATH101",
                    teacher: "testteacher",
                    progress: 100,
                    grade: "A",
                },
            ],
        });

        api.patch.mockResolvedValue({});
        api.post.mockResolvedValue({});

        vi.spyOn(window, "confirm").mockReturnValue(true);

        const screen = await render(<Completion />);

        await screen.getByRole(
            "button",
            { name: "Acknowledge Completion" }
        ).click();

        expect(window.confirm).toHaveBeenCalledWith(
            "Are you sure you want to acknowledge this course as complete?"
        );

        expect(api.patch).toHaveBeenCalledWith(
            "/courses/enrolments/1/acknowledge/"
        );

        expect(api.post).toHaveBeenCalledWith(
            "/courses/enrolments/1/complete/"
        );

        await expect.element(
            screen.getByText(
                "Course has been successfully completed and archived."
            )
        ).toBeInTheDocument();
    });


    test("does not acknowledge the course when confirmation is cancelled", async () => {
        api.get.mockResolvedValue({
            data: [
                {
                    id: 1,
                    course_name: "Mathematics",
                    course_code: "MATH101",
                    teacher: "testteacher",
                    progress: 100,
                    grade: "A",
                },
            ],
        });

        vi.spyOn(window, "confirm").mockReturnValue(false);

        const screen = await render(<Completion />);

        await screen.getByRole(
            "button",
            { name: "Acknowledge Completion" }
        ).click();

        expect(api.patch).not.toHaveBeenCalled();
        expect(api.post).not.toHaveBeenCalled();
    });


    test("displays an error when completion fails", async () => {
        api.get.mockResolvedValue({
            data: [
                {
                    id: 1,
                    course_name: "Mathematics",
                    course_code: "MATH101",
                    teacher: "testteacher",
                    progress: 100,
                    grade: "A",
                },
            ],
        });

        api.patch.mockRejectedValue({
            response: {
                data: {
                    detail: "Unable to complete course.",
                },
            },
        });

        vi.spyOn(window, "confirm").mockReturnValue(true);

        const screen = await render(<Completion />);

        await screen.getByRole(
            "button",
            { name: "Acknowledge Completion" }
        ).click();

        await expect.element(
            screen.getByText("Unable to complete course.")
        ).toBeInTheDocument();

        expect(api.patch).toHaveBeenCalledWith(
            "/courses/enrolments/1/acknowledge/"
        );

        expect(api.post).not.toHaveBeenCalled();
    });

});