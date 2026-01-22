import { Toaster } from "@/components/ui/sonner"
import { RouterProvider } from "react-router-dom";
import { router } from "@/constants/router/router";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Toaster />
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  );
}
