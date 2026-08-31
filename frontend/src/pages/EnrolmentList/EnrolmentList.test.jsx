import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router-dom";

import EnrolmentList from "./EnrolmentList";
import api from "../../services/api";

import { useAuth } from "../../context/AuthContext";

import {
    mockAdminEnrolments,
} from "../../test/mocks/dashboard";

vi.mock("../../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));

afterEach(() => {
    vi.restoreAllMocks();
});

const renderEnrolmentList = async (props = {}) => {
    return await render(
        <MemoryRouter>
            <EnrolmentList />
        </MemoryRouter>
    )
}

describe("Loading and data retrieval", () => {

    test("displays loading while enrolments are being retreived", async () => {
        vi.mocked(useAuth).mockReturnValue({
            user: {
                role: "admin",
            },
        });

        vi.spyOn(api, "get")
            .mockImplementation(
                () => new Promise(() => { })
            );

        const screen = await renderEnrolmentList()

        await expect.element(
            screen.getByText("Loading...")
        ).toBeInTheDocument();
    });

    test("EnrolmentList data fetching", async () => {
        vi.mocked(useAuth).mockReturnValue({
            user: {
                role: "admin",
            },
        });

        const getEnrolments = vi.spyOn(api, "get")
            .mockResolvedValue({
                data: mockAdminEnrolments
            })

        const screen = await renderEnrolmentList()

        expect(getEnrolments).toHaveBeenCalledWith(
            "/courses/enrolments/all/"
        )
    });

    test("display the enrolments correctly after being requested", async () => {
        vi.mocked(useAuth).mockReturnValue({
            user: {
                role: "admin",
            },
        })

        vi.spyOn(api, "get")
            .mockResolvedValue({
                data: [mockAdminEnrolments[0]]
            })

        const screen = await renderEnrolmentList()

        const title =
            screen.getByRole("heading", { level: 2 })
        await expect.element(title)
            .toHaveTextContent("studentone - MATH101")

        const courseParent =
            screen.getByText("Course:", { exact: true }).locator("..");
        await expect.element(courseParent)
            .toHaveTextContent("Mathematics")

        const codeParent =
            screen.getByText("Code:", { exact: true }).locator("..");
        await expect.element(codeParent)
            .toHaveTextContent("MATH101")

        const teacherParent =
            screen.getByText("Teacher:", { exact: true }).locator("..")
        await expect.element(teacherParent)
            .toHaveTextContent("teacherone")

        const statusParent =
            screen.getByText("Status:", { exact: true }).locator("..");
        await expect.element(statusParent)
            .toHaveTextContent("active")

        const progressParent =
            screen.getByText("Progress:", { exact: true }).locator("..");
        await expect.element(progressParent)
            .toHaveTextContent("50%")

        const gradeParent =
            screen.getByText("Grade:", { exact: true }).locator("..");
        await expect.element(gradeParent)
            .toHaveTextContent("Not graded")
    })

    test("when returned data is empty, display message communicating this", async () => {
        vi.mocked(useAuth).mockReturnValue({
            user: {
                role: "admin",
            },
        })

        vi.spyOn(api, "get")
            .mockResolvedValue({
                data: []
            })

        const screen = await renderEnrolmentList()

        const message =
            screen.getByText("No enrolments found.", { exact: true })

        await expect.element(message)
            .toBeInTheDocument()
    })

    test("display an error when the api call for the enrolments fails", async () => {
        vi.mocked(useAuth).mockReturnValue({
            user: {
                role: "admin",
            },
        })

        const screen = await renderEnrolmentList()

        vi.spyOn(api, "get")
            .mockRejectedValue(
                new Error("Something went wrong.")
            )

        const errorMessage =
            screen.getByText("Could not load enrolments", { exact: true })

        await expect.element(errorMessage)
            .toBeInTheDocument()
    })
})

describe("deleting enrolments", () => {
    test("clicking the delete button and confirming will delete an enrolment", async () => {
        vi.mocked(useAuth).mockReturnValue({
            user: {
                role: "admin",
            },
        })

        vi.spyOn(api, "get")
            .mockResolvedValue(
                {
                    data: mockAdminEnrolments
                }
            )

        vi.spyOn(window, "confirm")
            .mockReturnValue(true)

        const deleteMock = vi
            .spyOn(api, "delete")
            .mockResolvedValue({});

        const screen = await renderEnrolmentList()

        await screen.getByRole(
            "button",
            { name: "Delete" }
        ).nth(0).click()

        expect(deleteMock).toHaveBeenCalledWith(
            "/courses/enrolments/1/delete/"
        )

        //await needed?
        await expect(
            screen.getByRole("heading", {
                name: "studentone - MATH101"
            })
        ).not.toBeInTheDocument()


    })

    test("clicking delete and then cancelling the deletion will not delete the enrolment", async () => {
        vi.mocked(useAuth).mockReturnValue({
            user: {
                role: "admin",
            },
        })

        vi.spyOn(api, "get")
            .mockResolvedValue(
                {
                    data: mockAdminEnrolments
                }
            )

        vi.spyOn(window, "confirm")
            .mockReturnValue(false)


        const screen = await renderEnrolmentList()

        await screen.getByRole(
            "button",
            { name: "Delete" }
        ).nth(0).click()

        await expect.element(
            screen.getByRole("heading",
                { level: 2 }
            ).nth(0)
        ).toHaveTextContent("studentone - MATH101")

    })
})
//best way of getting this?

describe("Deletion errors", () => {
    test("failure in deleting an enrolment displays an error message", async () => {
        vi.mocked(useAuth).mockReturnValue({
            user: {
                role: "admin",
            },
        })

        vi.spyOn(api, "get")
            .mockResolvedValue(
                {
                    data: mockAdminEnrolments
                }
            )

        vi.spyOn(api, "delete")
            .mockRejectedValue(
                new Error("Delete Failed")
            );

        vi.spyOn(window, "confirm")
            .mockReturnValue(true)


        const screen = await renderEnrolmentList()

        await screen.getByRole(
            "button",
            { name: "Delete" }
        ).nth(0).click()

        await expect.element(
            screen.getByText("Could not delete enrolment.", { exact: true })
        ).toBeInTheDocument()

    })
})

