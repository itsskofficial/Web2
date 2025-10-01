import { Shape, FrameShape } from "@/redux/slice/shapes";
import * as htmlToImage from 'html-to-image';

// Helper to check if a shape is inside a frame's bounds
const isShapeInsideFrame = (shape: Shape, frame: FrameShape): boolean => {
    // Basic bounding box check
    if ('x' in shape && 'y' in shape && 'w' in shape && 'h' in shape) {
        return (
            shape.x >= frame.x &&
            shape.y >= frame.y &&
            shape.x + shape.w <= frame.x + frame.w &&
            shape.y + shape.h <= frame.y + frame.h
        );
    }
    // Add more specific checks for lines, arrows, etc. if needed
    return false;
}

// Get all shapes that are contained within a specific frame
const getShapesInsideFrame = (allShapes: Shape[], frame: FrameShape): Shape[] => {
    return allShapes.filter(shape => shape.id !== frame.id && isShapeInsideFrame(shape, frame));
}

// --- Main Snapshot Function ---

export const generateFrameSnapshot = async (
    allShapes: Shape[],
    frame: FrameShape
): Promise<Blob | null> => {
    const shapesInFrame = getShapesInsideFrame(allShapes, frame);

    // Create a temporary container element
    const container = document.createElement('div');
    container.style.width = `${frame.w}px`;
    container.style.height = `${frame.h}px`;
    container.style.position = 'absolute';
    container.style.left = '-9999px'; // Render off-screen
    container.style.backgroundColor = 'black'; // AI prefers black background
    container.style.overflow = 'hidden';

    // Render shapes into the container
    shapesInFrame.forEach(shape => {
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.border = `${shape.strokeWidth}px solid white`; // AI prefers white strokes
        
        // Adjust position relative to the frame
        const relX = ('x' in shape ? shape.x : 0) - frame.x;
        const relY = ('y' in shape ? shape.y : 0) - frame.y;

        el.style.left = `${relX}px`;
        el.style.top = `${relY}px`;

        if (shape.type === 'rect' || shape.type === 'ellipse') {
            el.style.width = `${shape.w}px`;
            el.style.height = `${shape.h}px`;
            if (shape.type === 'ellipse') {
                el.style.borderRadius = '50%';
            }
        }
        
        if (shape.type === 'text') {
            el.innerText = shape.text;
            el.style.color = 'white';
            el.style.fontSize = `${shape.fontSize}px`;
            el.style.fontFamily = shape.fontFamily;
            el.style.border = 'none';
        }

        // Add simplified rendering for other shapes if needed
        
        container.appendChild(el);
    });

    document.body.appendChild(container);

    try {
        const blob = await htmlToImage.toBlob(container, {
            width: frame.w,
            height: frame.h,
        });
        return blob;
    } catch (error) {
        console.error("Failed to generate frame snapshot:", error);
        return null;
    } finally {
        // Clean up the temporary element
        document.body.removeChild(container);
    }
};