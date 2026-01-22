import Home from "@/screens/Home";
import Login from "@/screens/Login";
import Signup from "@/screens/Signup";
import Userdashboard from "@/screens/Userdashboard";
import Eventdashboard from "@/screens/Eventdashboard";
import { Profile } from "@/screens/Profile";
import NotFound from "@/screens/NotFound";
import DashboardLayout from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
      <ProtectedRoute>
        <DashboardLayout>
          <Profile />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/userdashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Userdashboard />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/eventdashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Eventdashboard />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

