import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router-dom";

import EnrolmentCard from "./EnrolmentCard";

import { mockEnrolment, mockEnrolmentNoTeacher } from '../../test/mocks/displaycards'

const onDelete = vi.fn()
