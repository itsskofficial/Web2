"use client";

import { Doc } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";

interface ProjectCardProps {
  project: Doc<"projects">;
}

const generateGradientThumbnail = (seed: string) => {
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    ];
  
    // Simple hash function to get a consistent index from the project ID
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % gradients.length);
  
    return gradients[index];
  };

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { user } = useAuth();
  const sessionName =
    user?.firstName || user?.email?.split("@")[0];
  const slug = encodeURIComponent(sessionName?.toLowerCase() || "user");

  const thumbnailUrl = generateGradientThumbnail(project._id);

  return (
    <Link
      href={`/dashboard/${slug}/canvas/${project._id}`}
      className="group"
    >
      <div className="flex flex-col justify-between h-full rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <div
          className="aspect-[4/3] w-full bg-muted flex items-center justify-center text-white font-bold text-2xl"
          style={{ background: thumbnailUrl }}
        >
          {project.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col p-4">
          <h3 className="font-semibold text-lg truncate">{project.name}</h3>
          <p className="text-sm text-muted-foreground">
            Last modified{" "}
            {formatDistanceToNow(new Date(project._creationTime), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
    </Link>
  );
};