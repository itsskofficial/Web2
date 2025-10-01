import { FrameShape } from "@/redux/slice/shapes";
import { Button } from "@/components/ui/button";
import { Brush, Palette } from "lucide-react";
import { useFrame } from "@/hooks/use-frame";

export const Frame = ({
	shape,
	toggleInspiration,
}: {
	shape: FrameShape;
	toggleInspiration: () => void;
}) => {
	const { isGenerating, handleGenerateDesign } = useFrame(shape);

	return (
		<>
			<div
				className="absolute pointer-events-none backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] saturate-150"
				style={{
					left: shape.x,
					top: shape.y,
					width: shape.w,
					height: shape.h,
					borderRadius: "12px",
				}}
			/>
			<div
				className="absolute pointer-events-none whitespace-nowrap text-xs font-medium text-white/80 select-none"
				style={{
					left: shape.x,
					top: shape.y - 24,
					fontSize: "11px",
					lineHeight: "1.2",
				}}
			>
				Frame {shape.frameNumber}
			</div>
			<div
				className="absolute pointer-events-auto flex gap-4"
				style={{
					left: shape.x + shape.w - 235,
					top: shape.y - 36,
					zIndex: 1000,
				}}
				onClick={(e) => {
					e.stopPropagation();
				}}
			>
				<Button
					size="sm"
					variant="secondary"
					onClick={toggleInspiration}
					style={{ pointerEvents: "auto" }}
				>
					<Palette size={12} className="mr-2" />
					Inspiration
				</Button>
				<Button
					size="sm"
					variant="secondary"
					onClick={handleGenerateDesign}
					disabled={isGenerating}
					className={isGenerating ? "animate-pulse" : ""}
					style={{ pointerEvents: "auto" }}
				>
					<Brush
						size={12}
						className={isGenerating ? "animate-spin mr-2" : "mr-2"}
					/>
					{isGenerating ? "Generating..." : "Generate Design"}
				</Button>
			</div>
		</>
	);
};
