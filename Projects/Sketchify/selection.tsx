import { Shape } from '@/redux/slice/shapes'

interface SelectionOverlayProps {
  shape: Shape
  isSelected: boolean
}

export const SelectionOverlay = ({
  shape,
  isSelected,
}: SelectionOverlayProps) => {
  if (!isSelected) return null

  // Get bounding box based on shape type
  const getBounds = () => {
    switch (shape.type) {
      case 'frame':
      case 'rect':
      case 'ellipse':
      case 'generatedui':
        return {
          x: shape.x,
          y: shape.y,
          w: shape.w,
          h: shape.h, // Use the shape's height which gets updated by the component
        }
      case 'freedraw':
        if (shape.points.length === 0) return { x: 0, y: 0, w: 0, h: 0 }
        const xs = shape.points.map((p) => p.x)
        const ys = shape.points.map((p) => p.y)
        const minX = Math.min(...xs)
        const maxX = Math.max(...xs)
        const minY = Math.min(...ys)
        const maxY = Math.max(...ys)
        return {
          x: minX - 5, // Padding for stroke
          y: minY - 5,
          w: maxX - minX + 10,
          h: maxY - minY + 10,
        }
      case 'arrow':
      case 'line':
        const lineMinX = Math.min(shape.startX, shape.endX)
        const lineMaxX = Math.max(shape.startX, shape.endX)
        const lineMinY = Math.min(shape.startY, shape.endY)
        const lineMaxY = Math.max(shape.startY, shape.endY)
        return {
          x: lineMinX - 5,
          y: lineMinY - 5,
          w: lineMaxX - lineMinX + 10,
          h: lineMaxY - lineMinY + 10,
        }
      case 'text':
        // Account for text padding (px-2 py-1 = 8px horizontal, 4px vertical)
        const textWidth = Math.max(
          shape.text.length * (shape.fontSize * 0.6),
          100
        ) // Min width for empty/short text
        const textHeight = shape.fontSize * 1.2
        const paddingX = 8 // px-2 = 8px padding
        const paddingY = 4 // py-1 = 4px padding
        return {
          x: shape.x - 2, // Small margin around the text box
          y: shape.y - 2,
          w: textWidth + paddingX + 4, // Include padding + margin
          h: textHeight + paddingY + 4,
        }
      default:
        return { x: 0, y: 0, w: 0, h: 0 }
    }
  }

  const bounds = getBounds()

  // Only show resize handles for resizable shapes (exclude generatedui from resizing)
  const isResizable =
    shape.type === 'frame' ||
    shape.type === 'rect' ||
    shape.type === 'ellipse' ||
    shape.type === 'freedraw' ||
    shape.type === 'line' ||
    shape.type === 'arrow' ||
    shape.type === 'text'

  const handlePointerDown = (e: React.PointerEvent, corner: string) => {
    e.stopPropagation()
    // We'll handle the resize logic in the canvas hook
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

    // Add data attributes to identify the resize operation
    const event = new CustomEvent('shape-resize-start', {
      detail: { shapeId: shape.id, corner, bounds },
    })
    window.dispatchEvent(event)
  }

  const handlePointerMove = (e: React.PointerEvent, corner: string) => {
    if ((e.target as HTMLElement).hasPointerCapture(e.pointerId)) {
      const event = new CustomEvent('shape-resize-move', {
        detail: {
          shapeId: shape.id,
          corner,
          clientX: e.clientX,
          clientY: e.clientY,
          bounds,
        },
      })
      window.dispatchEvent(event)
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    const event = new CustomEvent('shape-resize-end', {
      detail: { shapeId: shape.id },
    })
    window.dispatchEvent(event)
  }

  return (
    <div
      className="absolute pointer-events-none border-2 border-blue-500 bg-blue-500/10"
      style={{
        left: bounds.x - 2,
        top: bounds.y - 2,
        width: bounds.w + 4,
        height: bounds.h + 4,
        borderRadius: shape.type === 'frame' ? '10px' : '4px',
      }}
    >
      {isResizable && (
        <>
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize pointer-events-auto"
            style={{ top: -6, left: -6 }}
            onPointerDown={(e) => handlePointerDown(e, 'nw')}
            onPointerMove={(e) => handlePointerMove(e, 'nw')}
            onPointerUp={handlePointerUp}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize pointer-events-auto"
            style={{ top: -6, right: -6 }}
            onPointerDown={(e) => handlePointerDown(e, 'ne')}
            onPointerMove={(e) => handlePointerMove(e, 'ne')}
            onPointerUp={handlePointerUp}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize pointer-events-auto"
            style={{ bottom: -6, left: -6 }}
            onPointerDown={(e) => handlePointerDown(e, 'sw')}
            onPointerMove={(e) => handlePointerMove(e, 'sw')}
            onPointerUp={handlePointerUp}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize pointer-events-auto"
            style={{ bottom: -6, right: -6 }}
            onPointerDown={(e) => handlePointerDown(e, 'se')}
            onPointerMove={(e) => handlePointerMove(e, 'se')}
            onPointerUp={handlePointerUp}
          />
        </>
      )}
      {!isResizable && (
        <>
          <div className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full -top-1 -left-1" />
          <div className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full -top-1 -right-1" />
          <div className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full -bottom-1 -left-1" />
          <div className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full -bottom-1 -right-1" />
        </>
      )}
    </div>
  )
}
