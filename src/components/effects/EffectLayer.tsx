"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ResultType } from "@/hooks/useDiceGame";

interface EffectLayerProps {
    resultType: ResultType | null;
}

// Particle types
type Particle = {
    id: number;
    x: number;
    y: number;
    rotation: number;
    scale: number;
    color?: string;
    delay: number;
    duration: number;
};

const generateParticles = (count: number): Particle[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // %
        y: Math.random() * 100, // %
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        delay: Math.random() * 0.5,
        duration: Math.random() * 2 + 1,
    }));
};

export const EffectLayer = ({ resultType }: EffectLayerProps) => {
    if (!resultType || resultType === 'NONE') return <RippleEffect active={resultType === 'NONE'} />;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {resultType === 'TRIPLE' && <SakuraEffect />}
            {resultType === 'SIGORO' && <ConfettiEffect />}
            {resultType === 'HIFUMI' && <LeavesEffect />}
        </div>
    );
};

/* --- Ripple Effect (Subtle background pulse) --- */
const RippleEffect = ({ active }: { active: boolean }) => {
    if (!active) return null;
    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <motion.div
                className="border-2 border-white/20 rounded-full"
                initial={{ width: 0, height: 0, opacity: 0.5 }}
                animate={{ width: 500, height: 500, opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            />
        </div>
    );
}

/* --- Sakura Effect (Triples) --- */
const SakuraEffect = () => {
    const particles = generateParticles(50);
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent"
            />
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute w-4 h-4 bg-pink-300 rounded-tl-xl rounded-br-xl opacity-80"
                    style={{ left: `${p.x}%`, top: -20 }}
                    animate={{
                        top: "110%",
                        rotate: [p.rotation, p.rotation + 360],
                        x: [0, (Math.random() - 0.5) * 100], // Drift
                    }}
                    transition={{
                        duration: p.duration + 2,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <div className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent text-6xl font-bold font-serif drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]">
                    大当り!
                </div>
            </motion.div>
        </>
    );
};

/* --- Confetti Effect (4-5-6) --- */
const COLORS = ["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#073B4C"];

const ConfettiEffect = () => {
    const particles = generateParticles(60);
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-white/10"
            />
            {particles.map((p, i) => (
                <motion.div
                    key={p.id}
                    className="absolute w-2 h-4"
                    style={{
                        left: "50%",
                        top: "50%",
                        backgroundColor: COLORS[i % COLORS.length]
                    }}
                    animate={{
                        x: (Math.random() - 0.5) * window.innerWidth,
                        y: (Math.random() - 0.5) * window.innerHeight,
                        rotate: p.rotation * 5,
                        opacity: [1, 0]
                    }}
                    transition={{
                        duration: 1.5,
                        ease: "circOut"
                    }}
                />
            ))}
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="absolute inset-0 flex items-center justify-center z-50"
            >
                <div className="text-white text-6xl font-extrabold font-serif drop-shadow-md">
                    シゴロ
                </div>
            </motion.div>
        </>
    );
};

/* --- Leaves Effect (1-2-3) --- */
const LeavesEffect = () => {
    const particles = generateParticles(30);
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-blue-900/30 grayscale"
            />
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute w-6 h-3 bg-amber-700/80 rounded-full"
                    style={{
                        left: `${p.x}%`,
                        top: -50,
                        clipPath: 'polygon(0% 50%, 50% 0%, 100% 50%, 50% 100%)' // Leaf shape roughly
                    }}
                    animate={{
                        top: "110%",
                        x: ["-20%", "20%"], // Wind sway
                        rotate: [0, 180]
                    }}
                    transition={{
                        duration: p.duration + 3,
                        ease: "easeIn",
                        repeat: Infinity,
                        repeatType: "mirror"
                    }}
                />
            ))}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
                className="absolute inset-0 flex items-end justify-center pb-20"
            >
                <div className="text-gray-400 text-3xl font-serif italic">
                    ヒフミ...
                </div>
            </motion.div>
        </>
    );
};
