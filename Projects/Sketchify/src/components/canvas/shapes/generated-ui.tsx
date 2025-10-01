import { GeneratedUIShape, updateShape } from "@/redux/slice/shapes";
import React, { useEffect, useRef } from "react";
import { useAppDispatch } from "@/redux/hooks";

interface GeneratedUIProps {
  shape: GeneratedUIShape;
}

export const GeneratedUI = ({ shape }: GeneratedUIProps) => {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);

  // Effect to update the shape's height based on its content
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          const newHeight = entry.contentRect.height;
          if (shape.h !== newHeight) {
            dispatch(updateShape({ id: shape.id, patch: { h: newHeight } }));
          }
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [shape.id, shape.h, dispatch]);

  return (
    <div
      style={{
        position: "absolute",
        left: shape.x,
        top: shape.y,
        width: shape.w,
        // Height is now controlled by the content via the effect
      }}
    >
      <div
        ref={containerRef}
        className="bg-white rounded-lg shadow-lg overflow-hidden"
        dangerouslySetInnerHTML={{ __html: shape.uiSpecData || "" }}
      />
    </div>
  );
};