import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { FrameShape, addGeneratedUI } from "@/redux/slice/shapes";
import { generateFrameSnapshot } from "@/lib/frame-snapshot";
import { toast } from "sonner";
import { nanoid } from "@reduxjs/toolkit";

export const useFrame = (frame: FrameShape) => {
  const dispatch = useAppDispatch();
  const allShapes = useAppSelector((state) => Object.values(state.shapes.shapes.entities));
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDesign = async () => {
    setIsGenerating(true);

    // 1. Create a snapshot of the frame's content
    const snapshotBlob = await generateFrameSnapshot(allShapes as Shape[], frame);
    if (!snapshotBlob) {
      toast.error("Failed to capture wireframe snapshot.");
      setIsGenerating(false);
      return;
    }

    // 2. Prepare form data for the API request
    const formData = new FormData();
    formData.append("image", snapshotBlob, "wireframe.png");
    formData.append("projectId", "your_project_id_here"); // TODO: Get this from URL params

    // 3. Create a placeholder shape on the canvas
    const newShapeId = nanoid();
    const position = {
      x: frame.x + frame.w + 50, // Position it to the right of the frame
      y: frame.y,
      w: 400, // Default width
      h: 600, // Default height
    };
    dispatch(
      addGeneratedUI({
        id: newShapeId,
        ...position,
        uiSpecData: "<div class='w-full h-full bg-muted animate-pulse'></div>", // Initial loading state
        sourceFrameId: frame.id,
      })
    );

    try {
      // 4. Call the generation API
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to generate design. Please try again.");
      }

      // 5. Stream the response into the placeholder shape
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedHtml = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedHtml += decoder.decode(value, { stream: true });
        
        // Throttle updates to avoid excessive re-renders
        // A more robust solution might use requestAnimationFrame
        dispatch(
          updateShape({
            id: newShapeId,
            patch: { uiSpecData: accumulatedHtml },
          })
        );
      }
      
      toast.success("Design generated successfully!");

    } catch (error: any) {
      toast.error(error.message);
      // Remove the placeholder on error
      dispatch(removeShape(newShapeId));
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, handleGenerateDesign };
};