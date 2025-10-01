import { useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { toast } from "sonner";
import { nanoid } from "@reduxjs/toolkit";
import { addGeneratedUI, updateShape } from "@/redux/slice/shapes";
import { useAppSelector } from "@/redux/hooks";

export const useGlobalChat = () => {
    const dispatch = useAppDispatch();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeGeneratedUiId, setActiveGeneratedUiId] = useState<string | null>(null);
    const [isGeneratingWorkflow, setIsGeneratingWorkflow] = useState(false);
    const allShapes = useAppSelector((state) => state.shapes.shapes.entities);

    const openChat = (generatedUiId: string) => {
        setActiveGeneratedUiId(generatedUiId);
        setIsChatOpen(true);
    };

    const closeChat = () => {
        setIsChatOpen(false);
        setActiveGeneratedUiId(null);
    };

    const toggleChat = (generatedUiId: string) => {
        if (isChatOpen && activeGeneratedUiId === generatedUiId) {
            closeChat();
        } else {
            openChat(generatedUiId);
        }
    };

    const generateWorkflow = async (generatedUiId: string) => {
        setIsGeneratingWorkflow(true);
        toast.info("Generating workflow pages...");

        const currentShape = allShapes[generatedUiId];
        if (!currentShape || currentShape.type !== 'generatedui' || !currentShape.uiSpecData) {
            toast.error("Source design not found or is empty.");
            setIsGeneratingWorkflow(false);
            return;
        }

        const pageTypes = ["Dashboard", "Settings", "User Profile", "Analytics"];
        const basePosition = { x: currentShape.x, y: currentShape.y + currentShape.h + 50 };
        const spacing = currentShape.w + 50;

        const generationPromises = pageTypes.map(async (pageType, index) => {
            const newShapeId = nanoid();
            const position = {
                x: basePosition.x + (index * spacing),
                y: basePosition.y,
                w: currentShape.w,
                h: currentShape.h,
            };

            // Add placeholder
            dispatch(addGeneratedUI({
                id: newShapeId,
                ...position,
                uiSpecData: "<div class='w-full h-full bg-muted animate-pulse'></div>",
                sourceFrameId: currentShape.sourceFrameId,
                isWorkflowPage: true,
            }));

            // Call API
            const response = await fetch('/api/generate/workflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mainPageHtml: currentShape.uiSpecData,
                    projectId: "your_project_id_here", // TODO: Get from params
                    pageType,
                })
            });

            if (!response.ok || !response.body) {
                throw new Error(`Failed to generate ${pageType} page.`);
            }

            // Stream response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedHtml = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                accumulatedHtml += decoder.decode(value, { stream: true });
                dispatch(updateShape({ id: newShapeId, patch: { uiSpecData: accumulatedHtml } }));
            }
        });

        try {
            await Promise.all(generationPromises);
            toast.success("Workflow pages generated successfully!");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsGeneratingWorkflow(false);
        }
    };


    return {
        isChatOpen,
        activeGeneratedUiId,
        openChat,
        closeChat,
        toggleChat,
        generateWorkflow,
        isGeneratingWorkflow,
    };
};