import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Redo2, Undo2 } from 'lucide-react';
import React from 'react';

export const History = () => {
    // TODO: Implement Undo/Redo logic by connecting to a history state
    const handleUndo = () => console.log("Undo");
    const handleRedo = () => console.log("Redo");

    return (
        <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-800/80 backdrop-blur-md border border-white/10">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={handleUndo} disabled>
                            <Undo2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Undo</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={handleRedo} disabled>
                            <Redo2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Redo</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};