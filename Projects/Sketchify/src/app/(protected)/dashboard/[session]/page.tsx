import { NewProjectButton } from "@/components/dashboard/new-project-button";
import { ProjectList } from "@/components/dashboard/project-list";
import React from "react";

const DashboardPage = () => {
  return (
    <div className="h-full">
      <div className="p-8 md:p-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground">
              Create and manage your design projects.
            </p>
          </div>
          <NewProjectButton />
        </div>
        <ProjectList />
      </div>
    </div>
  );
};

export default DashboardPage;