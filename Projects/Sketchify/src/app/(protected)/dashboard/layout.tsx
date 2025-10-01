import React from "react";

// This layout will be shared by the project dashboard and the canvas
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="h-full">{children}</div>;
};

export default DashboardLayout;