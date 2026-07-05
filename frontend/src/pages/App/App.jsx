import { 
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate
} from "react-router-dom";

//import Root from "../../layouts/Root";

import AuthLayout from "../../layouts/AuthLayout";
import AppLayout from "../../layouts/AppLayout";

import Welcome from "../Welcome/Welcome"
import Login from "../Login/Login";

import Dashboard from "../Dashboard/Dashboard";
import Courses from "../Courses/Courses";
import NewCourse from "../NewCourse/NewCourse";


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* All Access */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Welcome />} />
        <Route path="login" element={<Login />} />
      </Route>

      {/* Login Access */}
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Dashboard />} />

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/new" element={<NewCourse />} />
      </Route>
    </>
  )
)

// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route path="/" element={<Root />}>
//       {/* default address */}
//       <Route index element = {<Welcome />} />

//       {/* app pages */}
//       <Route path="login" element={<Login />} />
//       <Route path="courses" element={<Courses />} />
//       <Route path="courses/new" element={<NewCourse />} />

//     </Route>
//   )
// )


function App() {
  return <RouterProvider router={router} />
}

export default App;