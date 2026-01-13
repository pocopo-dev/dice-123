"use client";

import { useEffect, useRef, useCallback } from "react";

export const useGameSounds = () => {
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // ユーザーインタラクション後にAudioContextを作成/再開するため、初期化はハンドラ内で行うか、ここで行う
        // Next.jsのSSR対策でwindowチェック
        if (typeof window !== "undefined") {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioContextRef.current = new AudioContextClass();
            }
        }

        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    const initAudio = useCallback(() => {
        if (audioContextRef.current?.state === "suspended") {
            audioContextRef.current.resume();
        }
    }, []);

    // 茶碗の中で転がる音
    const playRollSound = useCallback(() => {
        const ctx = audioContextRef.current;
        if (!ctx) return;

        // 硬い素材同士が当たる「カコッ」「コロッ」という音(高音控えめVer)
        const playClack = (time: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            // 三角波: 丸みのある衝突音
            osc.type = "triangle";

            // 周波数を少し落ち着かせる (150Hz - 400Hz)
            const baseFreq = 150 + Math.random() * 250;
            osc.frequency.setValueAtTime(baseFreq, time);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, time + 0.05);

            // フィルターを閉じて高音を削る（マイルドにする）
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(600 + Math.random() * 600, time);
            filter.Q.value = 1; // マイルドに

            const duration = 0.08;
            gain.gain.setValueAtTime(0, time);
            // アタックも少し柔らかく
            gain.gain.linearRampToValueAtTime(0.5 + Math.random() * 0.2, time + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(time);
            osc.stop(time + duration + 0.1);
        };

        const now = ctx.currentTime;
        let t = now;
        const totalDuration = 0.6;
        while (t < now + totalDuration) {
            playClack(t);
            t += 0.06 + Math.random() * 0.08;
        }

    }, []);

    // エフェクト出現音（キラキラ音/インパクト音）
    const playEffectSound = useCallback((type: 'WIN' | 'NORMAL' = 'NORMAL') => {
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const now = ctx.currentTime;
        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        masterGain.gain.setValueAtTime(0.5, now);

        if (type === 'WIN') {
            // アルペジオ（メジャーコード）
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C Major
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = "sine";
                osc.frequency.value = freq;

                const time = now + i * 0.08;
                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5);

                osc.connect(gain);
                gain.connect(masterGain);

                osc.start(time);
                osc.stop(time + 2);
            });
        } else {
            // ドン！という音（和太鼓風）
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);

            gain.gain.setValueAtTime(1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now);
            osc.stop(now + 0.6);
        }

    }, []);

    return { initAudio, playRollSound, playEffectSound };
};
