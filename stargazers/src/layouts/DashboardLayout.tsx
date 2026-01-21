import React from "react";
import { Navbar } from "@/components/navbar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="flex justify-center w-full">
        <Navbar />
      </div>

      <div className="flex flex-grow justify-center items-center w-full">
        <div className="h-full w-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
