import React from "react";
import { Shape } from "@/redux/slice/shapes";
import { Rectangle } from "./rectangle";
import { Ellipse } from "./ellipse";
import { Line } from "./line";
import { Arrow } from "./arrow";
import { FreeDraw } from "./freedraw";
import { Text } from "./text";
import { Frame } from "./frame";
import { GeneratedUI } from "./generated-ui";

interface ShapeRendererProps {
	shape: Shape;
}

export const ShapeRenderer = ({ shape }: ShapeRendererProps) => {
	switch (shape.type) {
		case "rect":
			return <Rectangle shape={shape} />;
		case "ellipse":
			return <Ellipse shape={shape} />;
		case "line":
			return <Line shape={shape} />;
		case "arrow":
			return <Arrow shape={shape} />;
		case "freedraw":
			return <FreeDraw shape={shape} />;
		case "text":
			return <Text shape={shape} />;
		case "frame":
			// We pass dummy functions for now
			return <Frame shape={shape} toggleInspiration={() => {}} />;
		case "generatedui":
			return <GeneratedUI shape={shape} />;
		default:
			return null;
	}
};
