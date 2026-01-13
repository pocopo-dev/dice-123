import { useState, useCallback, useRef } from 'react';

export type GamePhase = 'IDLE' | 'ROLLING' | 'RESULT';
export type ResultType = 'TRIPLE' | 'SIGORO' | 'HIFUMI' | 'NORMAL' | 'NONE';

export interface GameResult {
    type: ResultType;
    message: string;
    score?: number;
}

export interface DiceState {
    id: number;
    value: number;
    rolling: boolean;
    visible: boolean;
}

const ROLL_DURATION = 1000; // Time per dice roll
const STAGGER_DELAY = 600;  // Delay between dice starts

export const useDiceGame = () => {
    const [phase, setPhase] = useState<GamePhase>('IDLE');
    const [dice, setDice] = useState<DiceState[]>([
        { id: 1, value: 1, rolling: false, visible: false },
        { id: 2, value: 1, rolling: false, visible: false },
        { id: 3, value: 1, rolling: false, visible: false },
    ]);
    const [result, setResult] = useState<GameResult | null>(null);

    // Audio refs could go here if sound was requested

    const generateRandomFace = () => Math.floor(Math.random() * 6) + 1;

    const determineResult = (d1: number, d2: number, d3: number): GameResult => {
        // 1. Triples (Zoro-me)
        if (d1 === d2 && d2 === d3) {
            if (d1 === 1) return { type: 'TRIPLE', message: 'ピン\nゾロ！' }; // Pin-zoro (1-1-1) is special 5x
            return { type: 'TRIPLE', message: `${d1}の\nゾロ目！` };
        }

        // Sort for sequence checks
        const sorted = [d1, d2, d3].sort((a, b) => a - b);
        const s1 = sorted[0], s2 = sorted[1], s3 = sorted[2];

        // 2. 4-5-6 (Sigoro)
        if (s1 === 4 && s2 === 5 && s3 === 6) {
            return { type: 'SIGORO', message: 'シゴロ！\n(4-5-6)' };
        }

        // 3. 1-2-3 (Hifumi)
        if (s1 === 1 && s2 === 2 && s3 === 3) {
            return { type: 'HIFUMI', message: 'ヒフミ...\n(1-2-3)' };
        }

        // 4. Normal (One pair + Single)
        if (d1 === d2) return { type: 'NORMAL', score: d3, message: `${d3}の目` };
        if (d1 === d3) return { type: 'NORMAL', score: d2, message: `${d2}の目` };
        if (d2 === d3) return { type: 'NORMAL', score: d1, message: `${d1}の目` };

        // 5. No Match (Menashi)
        return { type: 'NONE', message: '目なし' };
    };

    const startGame = useCallback(() => {
        if (phase === 'ROLLING') return;

        // Reset
        setPhase('ROLLING');
        setResult(null);
        setDice(prev => prev.map(d => ({ ...d, visible: false, rolling: false })));

        // Start rolling sequence
        // Dice 1
        setTimeout(() => {
            setDice(prev => [
                { ...prev[0], visible: true, rolling: true },
                prev[1],
                prev[2]
            ]);
        }, 0);

        // Dice 2
        setTimeout(() => {
            setDice(prev => [
                prev[0],
                { ...prev[1], visible: true, rolling: true },
                prev[2]
            ]);
        }, STAGGER_DELAY);

        // Dice 3
        setTimeout(() => {
            setDice(prev => [
                prev[0],
                prev[1],
                { ...prev[2], visible: true, rolling: true }
            ]);
        }, STAGGER_DELAY * 2);

        // Stop rolls and decide values
        const d1Val = generateRandomFace();
        const d2Val = generateRandomFace();
        const d3Val = generateRandomFace();

        const totalTime = STAGGER_DELAY * 2 + ROLL_DURATION;

        // We can stop them one by one or all near end. 
        // Let's stop them sequentially for suspense?
        // User said "Fast rotate, appear one by one". 
        // "Phase 2: 3 aligned -> Judge".
        // Let's stop them.

        const STOP_DELAY = 1200; // Time after start to stop

        setTimeout(() => {
            setDice(prev => [{ ...prev[0], value: d1Val, rolling: false }, prev[1], prev[2]]);
        }, STOP_DELAY);

        setTimeout(() => {
            setDice(prev => [prev[0], { ...prev[1], value: d2Val, rolling: false }, prev[2]]);
        }, STOP_DELAY + 400);

        setTimeout(() => {
            // Force all dice to stop rolling to prevent any state inconsistencies
            setDice(prev => [
                { ...prev[0], rolling: false }, // Ensure stopped
                { ...prev[1], rolling: false }, // Ensure stopped
                { ...prev[2], value: d3Val, rolling: false } // Stop final dice
            ]);

        }, STOP_DELAY + 1200);

        // Show Result after a short pause for dramatic effect
        setTimeout(() => {
            // Final Judgment
            const res = determineResult(d1Val, d2Val, d3Val);
            setResult(res);
            setPhase('RESULT');
        }, STOP_DELAY + 1800); // 0.6s pause after dice stop

    }, [phase]);

    const resetGame = () => {
        setPhase('IDLE');
        setResult(null);
        setDice(prev => prev.map(d => ({ ...d, visible: false, rolling: false })));
    };

    return {
        phase,
        dice,
        result,
        startGame,
        resetGame
    };
};
