"use client";

import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setScale, zoomBy } from '@/redux/slice/viewport';
import { Minus, Plus } from 'lucide-react';
import React from 'react';

export const Zoom = () => {
    const dispatch = useAppDispatch();
    const scale = useAppSelector((state) => state.viewport.scale);

    const handleZoomIn = () => {
        dispatch(zoomBy({ factor: 1.2, originScreen: { x: window.innerWidth / 2, y: window.innerHeight / 2 } }));
    };

    const handleZoomOut = () => {
        dispatch(zoomBy({ factor: 1 / 1.2, originScreen: { x: window.innerWidth / 2, y: window.innerHeight / 2 } }));
    };

    const handleSetZoom = (newScale: number) => {
        dispatch(setScale({ scale: newScale, originScreen: { x: window.innerWidth / 2, y: window.innerHeight / 2 } }));
    };

    return (
        <div className="flex items-center gap-2 p-1 rounded-lg bg-neutral-800/80 backdrop-blur-md border border-white/10 text-sm text-neutral-300">
            <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                <Minus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="px-2" onClick={() => handleSetZoom(1)}>
                {Math.round(scale * 100)}%
            </Button>
            <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
};