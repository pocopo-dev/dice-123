"use client";

import { useDiceGame } from "@/hooks/useDiceGame";
import { Dice } from "@/components/ui/Dice";
import { EffectLayer } from "@/components/effects/EffectLayer";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useEffect } from "react";

export const GameArea = () => {
    const { phase, dice, result, startGame, resetGame } = useDiceGame();
    const { initAudio, playRollSound, playEffectSound } = useGameSounds();

    // 音声効果のトリガー
    useEffect(() => {
        if (phase === 'ROLLING') {
            initAudio();
            // 定期的にならすか、あるいはアニメーションに合わせて鳴らす
            // ここでは簡易的に開始時に一回連続音を鳴らす（関数内でループ処理しているため）
            playRollSound();

            // ローリングが長い場合、途中で追加の音を入れることも可能だが、
            // 今はシンプルに開始時のSEとする。
            // もしフェーズが継続しているなら定期的に呼ぶロジックも追加可能。
            const interval = setInterval(() => {
                playRollSound();
            }, 600); // playRollSoundの持続時間に合わせてループ

            return () => clearInterval(interval);

        } else if (phase === 'RESULT' && result) {
            if (result.type === 'TRIPLE' || result.type === 'SIGORO' || result.type === 'HIFUMI') {
                playEffectSound('WIN');
            } else {
                playEffectSound('NORMAL');
            }
        }
    }, [phase, result, initAudio, playRollSound, playEffectSound]);

    const handleTap = () => {
        if (phase === 'IDLE' || phase === 'RESULT') {
            initAudio(); // ユーザー操作契機でAudioContextを再開
            startGame();
        }
    };

    return (
        <div
            className="relative h-[100dvh] w-full bg-[#0a0e17] overflow-hidden flex flex-col items-center justify-between py-12 select-none"
            onClick={handleTap}
        >
            {/* Background Ambient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />

            {/* Header */}
            <header className="z-10 text-center space-y-2">
                <h1 className="text-3xl md:text-5xl font-serif text-white tracking-widest drop-shadow-lg">
                    サイコロ<span className="text-red-500">振</span>りましょ
                </h1>
                <p className="text-gray-400 text-sm md:text-base font-light tracking-wider">
                    1人で遊ぶ 1・2・3
                </p>
            </header>

            {/* Dice Container */}
            {/* UPDATE: スマホでは scale-70 で発生する余白をマイナスマージンで相殺して詰める */}
            <main className="z-10 w-full max-w-4xl px-2 flex justify-center items-center gap-0 sm:gap-6 md:gap-16 perspective-[1000px]">
                {dice.map((d) => (
                    <motion.div
                        key={d.id}
                        // UPDATE: マイナスマージンを -10px に調整
                        className="origin-center scale-70 sm:scale-100 flex-shrink-0 -mx-[10px] sm:mx-0"
                        initial={{ scale: 0, opacity: 0, y: 50 }}
                        animate={{
                            scale: d.visible ? 1 : 0,
                            opacity: d.visible ? 1 : 0,
                            y: d.visible ? 0 : 50
                        }}
                    >
                        {/* Wrapper for responsive scaling if absolutely needed */}
                        <div className="">
                            <Dice
                                value={d.value}
                                rolling={d.rolling}
                                size={120}
                                className="shadow-2xl"
                            />
                        </div>
                    </motion.div>
                ))}
            </main>

            {/* Footer / Status */}
            <div className="z-20 h-24 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                    {phase === 'IDLE' && (
                        <motion.p
                            key="start"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-white/60 text-lg animate-pulse"
                        >
                            画面をタップして振る
                        </motion.p>
                    )}
                    {phase === 'ROLLING' && (
                        <motion.p
                            key="rolling"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-white/40 text-sm"
                        >
                            Rolling...
                        </motion.p>
                    )}
                    {phase === 'RESULT' && result && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.5, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            <p className={cn(
                                "mb-2 tracking-wider transition-all whitespace-pre-wrap leading-tight",
                                // 役ありは筆文字だが、サイズを少し抑えてサイコロとの干渉を防ぐ
                                // text-4xl(36px) / md:text-6xl(60px)
                                result.type !== 'NONE'
                                    ? "text-4xl md:text-6xl font-[family-name:var(--font-reggae-one)]"
                                    : "text-2xl md:text-4xl font-serif text-gray-400",

                                // 色の分岐
                                result.type === 'TRIPLE' || result.type === 'SIGORO'
                                    ? "text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                                    : result.type === 'NONE'
                                        ? "text-gray-400"
                                        : "text-white drop-shadow-md"
                            )}>
                                {result.message}
                            </p>
                            <p className="text-sm text-gray-500">
                                タップしてもう一度
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Global Effects Layer */}
            <EffectLayer resultType={result?.type || null} />
        </div>
    );
};
