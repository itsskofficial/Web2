"use client";

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setTool, Tool } from '@/redux/slice/shapes';
import { ArrowUpRight, Circle, Eraser, Frame, Hand, Minus, MousePointer2, Pencil, Square, Type } from 'lucide-react';
import React from 'react';

const tools: { name: Tool; icon: React.ElementType; tooltip: string }[] = [
    { name: 'select', icon: MousePointer2, tooltip: 'Select' },
    { name: 'frame', icon: Frame, tooltip: 'Frame' },
    { name: 'rect', icon: Square, tooltip: 'Rectangle' },
    { name: 'ellipse', icon: Circle, tooltip: 'Ellipse' },
    { name: 'freedraw', icon: Pencil, tooltip: 'Pencil' },
    { name: 'arrow', icon: ArrowUpRight, tooltip: 'Arrow' },
    { name: 'line', icon: Minus, tooltip: 'Line' },
    { name: 'text', icon: Type, tooltip: 'Text' },
    { name: 'eraser', icon: Eraser, tooltip: 'Eraser' },
];

export const Shapes = () => {
    const dispatch = useAppDispatch();
    const currentTool = useAppSelector((state) => state.shapes.tool);

    return (
        <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-800/80 backdrop-blur-md border border-white/10">
            <TooltipProvider>
                {tools.map(({ name, icon: Icon, tooltip }) => (
                    <Tooltip key={name}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => dispatch(setTool(name))}
                                data-active={currentTool === name}
                                className="data-[active=true]:bg-blue-500/20 data-[active=true]:text-blue-300"
                            >
                                <Icon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>
        </div>
    );
};