"use client";

import React, { useState } from 'react';
import { Doc } from '@/convex/_generated/dataModel';
import { Button } from '../ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface StyleGuideDisplayProps {
    project: Doc<"projects">;
}

export const StyleGuideDisplay = ({ project }: StyleGuideDisplayProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const updateStyleGuide = useMutation(api.projects.updateStyleGuide);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate/style', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: project._id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate style guide');
            }

            const result = await response.json();
            
            await updateStyleGuide({
                projectId: project._id,
                styleGuide: result.styleGuide,
            });

            toast.success('Style guide generated successfully!');

        } catch (error: any) {
            toast.error(error.message || 'An unexpected error occurred.');
        } finally {
            setIsGenerating(false);
        }
    };

    const styleGuide = project.styleGuide;

    return (
        <div className="p-4 border rounded-lg bg-card h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Generated Design System</h2>
                <Button onClick={handleGenerate} disabled={isGenerating || (project.moodboardImages || []).length === 0}>
                    {isGenerating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Generate with AI
                </Button>
            </div>
            {styleGuide ? (
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">{styleGuide.theme.name}</h3>
                        <p className="text-muted-foreground text-sm">{styleGuide.theme.description}</p>
                    </div>
                    {styleGuide.colorSections.map((section: any) => (
                        <div key={section.title}>
                            <h4 className="font-medium mb-2 capitalize">{section.title}</h4>
                            <div className="flex flex-wrap gap-4">
                                {section.swatches.map((swatch: any) => (
                                    <div key={swatch.name} className="flex items-center gap-2">
                                        <div
                                            className="h-8 w-8 rounded-full border"
                                            style={{ backgroundColor: swatch.hexColor }}
                                        />
                                        <div>
                                            <p className="text-sm font-medium">{swatch.name}</p>
                                            <p className="text-xs text-muted-foreground">{swatch.hexColor}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {styleGuide.typographySections.map((section: any) => (
                        <div key={section.title}>
                             <h4 className="font-medium mb-2 capitalize">{section.title}</h4>
                             <div className="space-y-4">
                                {section.styles.map((style: any) => (
                                    <div key={style.name}>
                                        <p className="text-sm text-muted-foreground">{style.name}</p>
                                        <p style={{
                                            fontFamily: style.fontFamily,
                                            fontWeight: style.fontWeight,
                                            fontSize: style.fontSize,
                                            lineHeight: style.lineHeight,
                                        }}>
                                            The quick brown fox jumps over the lazy dog.
                                        </p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">
                        Add images to your mood board and click &quot;Generate with AI&quot; to create a design system.
                    </p>
                </div>
            )}
        </div>
    );
};