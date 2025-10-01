"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { panMove, panStart, panEnd, wheelZoom } from "@/redux/slice/viewport";
import React, { useState } from "react";

/**
 * The master hook for all canvas interactions.
 * This will grow significantly in the next phases.
 */
export const useCanvas = () => {
  const dispatch = useAppDispatch();
  const viewport = useAppSelector((state) => state.viewport);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // POINTER/WHEEL EVENT HANDLERS
  // These will be attached to the main canvas div.

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const point = { x: e.clientX, y: e.clientY };
    dispatch(wheelZoom({ deltaY: e.deltaY, originScreen: point }));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    // For now, we only handle panning.
    // In the next phase, this will handle tool selection (drawing, selecting, etc.)
    if (e.button === 1 || isSpacePressed) { // Middle mouse or spacebar
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dispatch(panStart({ screen: { x: e.clientX, y: e.clientY } }));
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (viewport.mode === 'panning') {
        dispatch(panMove({ x: e.clientX, y: e.clientY }));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (viewport.mode === 'panning') {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        dispatch(panEnd());
    }
  };

  // KEYBOARD EVENT HANDLERS
  // These will be attached to the window.

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ') {
        setIsSpacePressed(true);
    }
  }

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === ' ') {
        setIsSpacePressed(false);
    }
  }

  // Effect to add and remove global keyboard listeners
  React.useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
    }
  }, []);


  return {
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
};