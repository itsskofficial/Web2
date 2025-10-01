import { Moodboard } from '@/components/style-guide/moodboard';
import { StyleGuideDisplay } from '@/components/style-guide/style-guide-display';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { fetchQuery } from 'convex/nextjs';
import React from 'react';

interface StyleGuidePageProps {
    params: {
        project: Id<"projects">
    }
}

const StyleGuidePage = async ({ params }: StyleGuidePageProps) => {
    const project = await fetchQuery(api.projects.getProjectById, { projectId: params.project });

    if (!project) {
        return <div>Project not found.</div>
    }

    return (
        <div className="p-8 md:p-12">
            <h1 className="text-3xl font-bold mb-2">Style Guide</h1>
            <p className="text-muted-foreground mb-8">
                Generate and manage the design system for your project.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Moodboard project={project} />
                </div>
                <div className="lg:col-span-2">
                    <StyleGuideDisplay project={project} />
                </div>
            </div>
        </div>
    );
};

export default StyleGuidePage;