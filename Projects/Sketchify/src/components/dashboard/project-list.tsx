"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ProjectCard } from "./project-card";
import { Loader2 } from "lucide-react";

export const ProjectList = () => {
  const projects = useQuery(api.projects.getProjectsForUser);

  if (projects === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center h-64 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold">No projects yet</h2>
        <p className="text-muted-foreground">
          Click on &quot;New Project&quot; to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  );
};