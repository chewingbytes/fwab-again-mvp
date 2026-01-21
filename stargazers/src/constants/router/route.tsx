import Home from "@/screens/Home";
import Login from "@/screens/Login";
import Signup from "@/screens/Signup";
import Userdashboard from "@/screens/Userdashboard";
import Eventdashboard from "@/screens/Eventdashboard";
import { Profile }from "@/screens/Profile";
import DashboardLayout from "@/layouts/DashboardLayout";

type Route = {
  path: string;
  element: JSX.Element;
};

export const ROUTES: Route[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/profile",
    element: (
      <DashboardLayout>
        <Profile />
      </DashboardLayout>
    ),
  },
  {
    path: "/userdashboard",
    element: (
      <DashboardLayout>
        <Userdashboard />
      </DashboardLayout>
    ),
  },
  {
    path: "/eventdashboard",
    element: (
      <DashboardLayout>
        <Eventdashboard />
      </DashboardLayout>
    ),
  },
];
