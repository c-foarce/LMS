import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate
} from "react-router-dom";

//import Root from "../../layouts/Root";

import { AuthProvider } from "../../context/AuthContext";

import ProtectedRoute from "../../components/ProtectedRoute";
import RoleRoute from "../../components/RoleRoute";

import AuthLayout from "../../layouts/AuthLayout";
import AppLayout from "../../layouts/AppLayout";

import Welcome from "../Welcome/Welcome"
import Login from "../Login/Login";

import Dashboard from "../Dashboard/Dashboard";
import Courses from "../Courses/Courses";
import NewCourse from "../NewCourse/NewCourse";
import NewUser from "../NewUser/NewUser";
import NewEnrolment from "../NewEnrolment/NewEnrolment";


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* All Access */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Welcome />} />
        <Route path="login" element={<Login />} />
      </Route>
      {/*Anyone can access this */}
      {/* Login Access */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/*Anyone can access this */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/*Anyone can access this */}
        <Route
          path="dashboard"
          element={<Dashboard />}
        />
        {/*Anyone can access this */}
        <Route
          path="courses"
          element={<Courses />}
        />

        <Route
          path="courses/new"
          element={
            <RoleRoute roles={["teacher", "admin"]}>
              <NewCourse />
            </RoleRoute>
          }
        />

        <Route
          path="accounts/new"
          element={
            <RoleRoute roles={["admin"]}>
              <NewUser />
            </RoleRoute>
          }
        />

        <Route
          path="courses/enrolments/new"
          element={
            <RoleRoute roles={["teacher", "admin"]}>
              <NewEnrolment />
            </RoleRoute>
          }
        />

      </Route>
    </>
  )
)


function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App;