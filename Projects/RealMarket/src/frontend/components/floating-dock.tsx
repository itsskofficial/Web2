"use client";

import { cn } from "@/lib/utils";
import {
	AnimatePresence,
	MotionValue,
	motion,
	useMotionValue,
	useSpring,
	useTransform,
} from "framer-motion";
import { useRef, useState } from "react";

type Mode = "explore" | "compare";

interface FloatingDockProps {
	activeMode: Mode;
	onModeChange: (mode: Mode) => void;
	items: {
		title: Mode;
		icon: React.ReactNode;
	}[];
}

export const FloatingDock = ({
	items,
	activeMode,
	onModeChange,
}: FloatingDockProps) => {
	const mouseY = useMotionValue(Infinity);

	return (
		<motion.div
			onMouseMove={(e) => mouseY.set(e.pageY)}
			onMouseLeave={() => mouseY.set(Infinity)}
			className={cn(
				"fixed top-1/2 left-4 z-50 -translate-y-1/2", // Position left-center
				"flex flex-col items-start gap-3 rounded-2xl bg-card p-2 shadow-lg border"
			)}
		>
			{items.map((item) => (
				<IconContainer
					mouseY={mouseY}
					key={item.title}
					isActive={activeMode === item.title}
					onClick={() => onModeChange(item.title)}
					{...item}
				/>
			))}
		</motion.div>
	);
};

function IconContainer({
	mouseY,
	title,
	icon,
	isActive,
	onClick,
}: {
	mouseY: MotionValue;
	title: string;
	icon: React.ReactNode;
	isActive: boolean;
	onClick: () => void;
}) {
	const ref = useRef<HTMLButtonElement>(null);

	const distance = useTransform(mouseY, (val) => {
		const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
		return val - bounds.y - bounds.height / 2;
	});

	// Animate size based on mouse proximity
	const sizeTransform = useTransform(distance, [-100, 0, 100], [48, 64, 48]);
	const size = useSpring(sizeTransform, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});

	// Animate icon size
	const iconSizeTransform = useTransform(distance, [-100, 0, 100], [24, 32, 24]);
	const iconSize = useSpring(iconSizeTransform, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});

	const [hovered, setHovered] = useState(false);

	return (
		<motion.button
			ref={ref}
			onClick={onClick}
			style={{ width: size, height: size }}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			className={cn(
				"relative flex aspect-square items-center justify-center rounded-full transition-colors",
				isActive
					? "bg-primary text-primary-foreground"
					: "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
			)}
		>
			<AnimatePresence>
				{hovered && (
					<motion.div
						initial={{ opacity: 0, x: -10, y: "-50%" }}
						animate={{ opacity: 1, x: 0, y: "-50%" }}
						exit={{ opacity: 0, x: -10, y: "-50%" }}
						className="absolute left-full ml-4 top-1/2 w-fit rounded-md bg-card border px-2 py-0.5 text-xs font-medium whitespace-nowrap text-card-foreground"
					>
						{title.charAt(0).toUpperCase() + title.slice(1)}
					</motion.div>
				)}
			</AnimatePresence>
			<motion.div
				style={{ width: iconSize, height: iconSize }}
				className="flex items-center justify-center"
			>
				{icon}
			</motion.div>
		</motion.button>
	);
}