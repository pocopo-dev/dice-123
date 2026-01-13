"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DiceProps {
    value: number;
    rolling: boolean;
    size?: number;
    className?: string;
}

const DOT_POSITIONS: Record<number, number[][]> = {
    1: [[50, 50]],
    2: [[20, 20], [80, 80]],
    3: [[20, 20], [50, 50], [80, 80]],
    4: [[20, 20], [20, 80], [80, 20], [80, 80]],
    5: [[20, 20], [20, 80], [50, 50], [80, 20], [80, 80]],
    6: [[20, 20], [20, 80], [20, 50], [80, 20], [80, 80], [80, 50]],
};

export const Dice = ({ value, rolling, size = 80, className }: DiceProps) => {
    // Random rotation for rolling state
    const randomRotate = () => ({
        rotateX: Math.random() * 360 * 5,
        rotateY: Math.random() * 360 * 5,
        rotateZ: Math.random() * 360 * 5,
    });

    // Target rotation for each value to face front
    // Front: 1 (Z+), Back: 6 (Z-), Top: 2 (X-), Bottom: 5 (X+), Right: 3 (Y-), Left: 4 (Y+)
    // Correct rotations to bring face to front (Z+):
    const getTargetRotation = (val: number) => {
        switch (val) {
            case 1: return { rotateX: 0, rotateY: 0, rotateZ: 0 };
            case 6: return { rotateX: 180, rotateY: 0, rotateZ: 0 };
            case 2: return { rotateX: -90, rotateY: 0, rotateZ: 0 };
            case 5: return { rotateX: 90, rotateY: 0, rotateZ: 0 };
            case 3: return { rotateX: 0, rotateY: -90, rotateZ: 0 };
            case 4: return { rotateX: 0, rotateY: 90, rotateZ: 0 };
            default: return { rotateX: 0, rotateY: 0, rotateZ: 0 };
        }
    };

    return (
        <div className={cn("relative perspective-[1000px]", className)} style={{ width: size, height: size }}>
            <motion.div
                className="w-full h-full relative"
                animate={rolling ? randomRotate() : getTargetRotation(value)}
                transition={{
                    duration: rolling ? 0.3 : 0.6,
                    repeat: rolling ? Infinity : 0,
                    ease: "easeOut",
                    type: "spring", stiffness: 60, damping: 20
                }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {[1, 6, 2, 5, 3, 4].map((faceValue) => (
                    <Face key={faceValue} value={faceValue} size={size} />
                ))}
            </motion.div>

            {/* Shadow */}
            <div
                className="absolute bottom-[-30%] left-1/2 -translate-x-1/2 bg-black/60 blur-lg rounded-full"
                style={{ width: size * 0.8, height: size * 0.2 }}
            />
        </div>
    );
};

const Face = ({ value, size }: { value: number; size: number }) => {
    let transform = "";
    const half = size / 2;
    // Transforms to place faces in cube formation
    switch (value) {
        case 1: transform = `translateZ(${half}px)`; break;
        case 6: transform = `rotateY(180deg) translateZ(${half}px)`; break;
        case 2: transform = `rotateX(90deg) translateZ(${half}px)`; break;
        case 5: transform = `rotateX(-90deg) translateZ(${half}px)`; break;
        case 3: transform = `rotateY(90deg) translateZ(${half}px)`; break; // Right
        case 4: transform = `rotateY(-90deg) translateZ(${half}px)`; break; // Left
    }

    return (
        <div
            className="absolute inset-0 bg-[#f0f0f0] rounded-xl border border-gray-300 flex items-center justify-center backface-hidden"
            style={{ transform, width: size, height: size, backfaceVisibility: 'hidden' }}
        >
            {/* Inner glare */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-gray-300 opacity-60 rounded-xl" />

            {DOT_POSITIONS[value].map((pos, i) => (
                <div
                    key={i}
                    className={cn(
                        "absolute rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]",
                        value === 1 ? "bg-red-600" : "bg-black"
                    )}
                    style={{
                        width: value === 1 ? "32%" : "20%",
                        height: value === 1 ? "32%" : "20%",
                        left: `${pos[0]}%`,
                        top: `${pos[1]}%`,
                        transform: "translate(-50%, -50%)",
                    }}
                />
            ))}
        </div>
    );
};
