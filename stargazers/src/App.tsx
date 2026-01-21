import { Toaster } from "@/components/ui/sonner"
import { RouterProvider } from "react-router-dom";
import { router } from "@/constants/router/router";

export default function App() {
  return (
      <div className="App">
        <Toaster />
        <RouterProvider router={router} />
      </div>
  );
}
