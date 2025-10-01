"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

export const NewProjectButton = () => {
    const [isPending, setIsPending] = useState(false);
    const create = useMutation(api.projects.createProject);

    const onClick = () => {
        setIsPending(true);
        // Get the current number of projects to name the new one
        // This is a simplified approach. A more robust solution might handle naming in the backend.
        const newProjectName = `Untitled Project`;

        create({ name: newProjectName })
            .then((id) => {
                toast.success("New project created!");
                // Optionally redirect to the new project: router.push(`/canvas/${id}`);
            })
            .catch(() => toast.error("Failed to create project."))
            .finally(() => setIsPending(false));
    };

    return (
        <Button onClick={onClick} disabled={isPending}>
            {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
                <Plus className="h-4 w-4 mr-2" />
            )}
            New Project
        </Button>
    );
};