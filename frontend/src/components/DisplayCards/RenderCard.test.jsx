import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import {
    MemoryRouter,
} from "react-router-dom";

import RenderCard from "./RenderCard";

import { mockCourse } from "../../test/mocks/displaycards";



describe("course details", () => {

    test("displays the course title and details", async () => {
        const details = [
            { label: "Subject", value: mockCourse.subject_name },
            { label: "Code", value: mockCourse.code },
            { label: "Teacher", value: mockCourse.teacher_name },
        ];

        const screen = await render(
            <MemoryRouter>
                <RenderCard
                    title={mockCourse.subject_name}
                    details={details}
                />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByRole("heading", {
                name: mockCourse.subject_name
            })
        ).toBeInTheDocument();

        for (const { label, value } of details) {
            await expect.element(
                screen.getByText(
                    `${label}: ${value}`,
                    { exact: true }
                )
            ).toBeInTheDocument();
        }
    });

});

describe("actions", () => {

    test("displays supplied actions", async () => {
        const screen = await render(
            <MemoryRouter>
                <RenderCard
                    title={mockCourse.subject_name}
                    details={[]}
                    actions={
                        <>
                            <button>Edit</button>
                            <button>Delete Course</button>
                        </>
                    }
                />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByRole("button", { name: "Edit" })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole(
                "button",
                { name: "Delete Course" }
            )
        ).toBeInTheDocument();
    });


    test("does not display actions when actions are not provided", async () => {
        const screen = await render(
            <MemoryRouter>
                <RenderCard
                    title={mockCourse.subject_name}
                    details={[]}
                />
            </MemoryRouter>
        );

        await expect.element(
            screen.getByRole("button")
        ).not.toBeInTheDocument();
    });

});