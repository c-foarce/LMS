import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter , Routes, Route} from "react-router-dom";

import DeniedAccess from "./DeniedAccess";

const renderDeniedAccess = async () => {
    return render(
        <MemoryRouter>
            <DeniedAccess />
        </MemoryRouter>
    );
};

    test("renders access denied message and dashboard button", async () => {
        const screen = await renderDeniedAccess();

        await expect.element(
            screen.getByRole("heading", { name: "Access Denied" })
        ).toBeInTheDocument();

        await expect.element(
            screen.getByText(
                "You do not have permission to access this page."
            )
        ).toBeInTheDocument();

        await expect.element(
            screen.getByRole("button", { name: "Return to Dashboard" })
        ).toBeInTheDocument();
    });

    test("navigates to dashboard when button is clicked", async () => {
        const screen = await render(
            <MemoryRouter initialEntries={["/denied"]}>
                <Routes>
                    <Route path="/denied" element={<DeniedAccess />} />
                    <Route path="/dashboard" element={<h1>Dashboard</h1>} />
                </Routes>
            </MemoryRouter>
        );

        await screen.getByRole("button", {
            name: "Return to Dashboard",
        }).click();

        await expect.element(
            screen.getByRole("heading", { name: "Dashboard" })
        ).toBeInTheDocument();
    });
