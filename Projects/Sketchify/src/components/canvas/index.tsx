"use client";

import React from "react";
import { useCanvas } from "@/hooks/use-canvas";
import { useAppSelector } from "@/redux/hooks";
import { ShapeRenderer } from "./shapes";
import {
  ArrowPreview,
  EllipsePreview,
  FramePreview,
  LinePreview,
  RectanglePreview,
  FreeDrawStrokePreview,
} from "./shapes/previews";
import { SelectionOverlay } from "./shapes/selection";
import { Toolbar } from "./toolbar";

export const Canvas = () => {
  const {
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    getDraftShape,
    getFreeDrawPoints,
  } = useCanvas();

  const viewport = useAppSelector((state) => state.viewport);
  const shapes = useAppSelector((state) => Object.values(state.shapes.shapes.entities));
  const selectedShapes = useAppSelector((state) => state.shapes.selected);

  const draftShape = getDraftShape();
  const freeDrawPoints = getFreeDrawPoints();

  return (
    <div className="h-full w-full relative overflow-hidden bg-background">
      <div
        ref={(el) => {
          // This part will be used later to attach the ref
        }}
        className="absolute inset-0"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div
          className="absolute"
          style={{
            transform: `translate(${viewport.translate.x}px, ${viewport.translate.y}px) scale(${viewport.scale})`,
            transformOrigin: "0 0",
          }}
        >
          {/* Render all committed shapes */}
          {shapes.map((shape) => {
            if (!shape) return null;
            return <ShapeRenderer key={shape.id} shape={shape} />;
          })}

          {/* Render draft shapes (previews) */}
          {draftShape && draftShape.type === "rect" && (
            <RectanglePreview
              startWorld={draftShape.start}
              currentWorld={draftShape.end}
            />
          )}
          {draftShape && draftShape.type === "ellipse" && (
            <EllipsePreview
              startWorld={draftShape.start}
              currentWorld={draftShape.end}
            />
          )}
          {draftShape && draftShape.type === "line" && (
            <LinePreview
              startWorld={draftShape.start}
              currentWorld={draftShape.end}
            />
          )}
          {draftShape && draftShape.type === "arrow" && (
            <ArrowPreview
              startWorld={draftShape.start}
              currentWorld={draftShape.end}
            />
          )}
          {draftShape && draftShape.type === "frame" && (
            <FramePreview
              startWorld={draftShape.start}
              currentWorld={draftShape.end}
            />
          )}
          {freeDrawPoints.length > 1 && (
            <FreeDrawStrokePreview points={freeDrawPoints} />
          )}

          {/* Render selection overlays */}
          {shapes.map((shape) => {
            if (!shape) return null;
            return (
              <SelectionOverlay
                key={`selection-${shape.id}`}
                shape={shape}
                isSelected={!!selectedShapes[shape.id]}
              />
            );
          })}
        </div>
      </div>
      <Toolbar />
    </div>
  );
};