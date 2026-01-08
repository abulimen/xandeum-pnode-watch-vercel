'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useAppLoading } from '@/contexts/AppLoadingContext';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export function PagePreloader() {
    const { isInitialLoading } = useAppLoading();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch - default to dark until mounted
    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = !mounted || resolvedTheme === 'dark';

    // Theme-based colors matching the logo (purple to magenta gradient)
    const colors = isDark ? {
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1025 50%, #0a0a0f 100%)',
        gridColor: 'rgba(168, 85, 247, 0.08)',
        textPrimary: 'text-white/90',
        textSecondary: 'text-white/50',
        textLoading: 'text-white/40',
        particleColors: ['#a855f7', '#d946ef', '#8b5cf6'],
        ringOuter: '#a855f7',
        ringMiddle: 'border-purple-500/30',
        ringInner: '#d946ef',
        glowColor: 'bg-purple-500/20',
        gradientText: 'from-purple-400 via-fuchsia-400 to-pink-400',
        barGradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
        orbitBg: 'from-purple-400 to-fuchsia-500',
        orbitShadow: 'shadow-purple-500/40',
    } : {
        background: 'linear-gradient(135deg, #faf5ff 0%, #fdf4ff 50%, #faf5ff 100%)',
        gridColor: 'rgba(168, 85, 247, 0.12)',
        textPrimary: 'text-slate-800',
        textSecondary: 'text-slate-500',
        textLoading: 'text-slate-400',
        particleColors: ['#a855f7', '#d946ef', '#8b5cf6'],
        ringOuter: '#9333ea',
        ringMiddle: 'border-purple-400/40',
        ringInner: '#c026d3',
        glowColor: 'bg-purple-400/15',
        gradientText: 'from-purple-600 via-fuchsia-600 to-pink-600',
        barGradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
        orbitBg: 'from-purple-500 to-fuchsia-600',
        orbitShadow: 'shadow-purple-500/50',
    };

    return (
        <AnimatePresence>
            {isInitialLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
                    style={{ background: colors.background }}
                >
                    {/* Animated background grid */}
                    <div className="absolute inset-0 overflow-hidden opacity-40">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `
                                linear-gradient(${colors.gridColor} 1px, transparent 1px),
                                linear-gradient(90deg, ${colors.gridColor} 1px, transparent 1px)
                            `,
                            backgroundSize: '60px 60px',
                            animation: 'gridMove 25s linear infinite',
                        }} />
                    </div>

                    {/* Floating particles - uses deterministic values to avoid hydration mismatch */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(25)].map((_, i) => {
                            // Deterministic pseudo-random values based on index
                            const seed1 = ((i * 17 + 7) % 100) / 100;
                            const seed2 = ((i * 31 + 13) % 100) / 100;
                            const seed3 = ((i * 23 + 3) % 100) / 100;
                            const seed4 = ((i * 41 + 19) % 100) / 100;

                            return (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full"
                                    style={{
                                        width: `${3 + seed1 * 4}px`,
                                        height: `${3 + seed2 * 4}px`,
                                        background: colors.particleColors[i % 3],
                                        left: `${seed3 * 100}%`,
                                        top: `${seed4 * 100}%`,
                                        filter: 'blur(0.5px)',
                                    }}
                                    animate={{
                                        y: [0, -40, 0],
                                        x: [0, seed1 * 20 - 10, 0],
                                        opacity: isDark ? [0.1, 0.6, 0.1] : [0.15, 0.4, 0.15],
                                        scale: [1, 1.3, 1],
                                    }}
                                    transition={{
                                        duration: 3 + seed2 * 3,
                                        repeat: Infinity,
                                        delay: seed3 * 3,
                                        ease: 'easeInOut',
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* Main content */}
                    <div className="relative z-10 flex flex-col items-center gap-6">
                        {/* Logo with animations */}
                        <div className="relative">
                            {/* Glow effect behind logo */}
                            <motion.div
                                className={`absolute inset-0 ${colors.glowColor} rounded-full blur-3xl scale-150`}
                                animate={{
                                    opacity: [0.3, 0.6, 0.3],
                                    scale: [1.4, 1.6, 1.4],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />

                            {/* Outer rotating ring */}
                            <motion.div
                                className="absolute -inset-4 rounded-full border-2 border-transparent"
                                style={{
                                    borderTopColor: colors.ringOuter,
                                    borderRightColor: colors.ringOuter,
                                }}
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                            />

                            {/* Middle pulsing ring */}
                            <motion.div
                                className={`absolute -inset-2 rounded-full border ${colors.ringMiddle}`}
                                animate={{
                                    scale: [1, 1.08, 1],
                                    opacity: [0.3, 0.5, 0.3],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />

                            {/* Inner spinning ring (opposite direction) */}
                            <motion.div
                                className="absolute -inset-1 rounded-full border-2 border-transparent"
                                style={{
                                    borderBottomColor: colors.ringInner,
                                    borderLeftColor: colors.ringInner,
                                }}
                                animate={{ rotate: -360 }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                            />

                            {/* Logo image */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <Image
                                    src="/logo.png"
                                    alt="pNode Watch"
                                    width={100}
                                    height={100}
                                    className="relative z-10 drop-shadow-2xl"
                                    priority
                                />
                            </motion.div>

                            {/* Orbiting particles */}
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className={`absolute w-2.5 h-2.5 bg-gradient-to-br ${colors.orbitBg} rounded-full shadow-lg ${colors.orbitShadow}`}
                                    style={{
                                        top: '50%',
                                        left: '50%',
                                        marginTop: '-5px',
                                        marginLeft: '-5px',
                                    }}
                                    animate={{
                                        x: [
                                            Math.cos((i * 2 * Math.PI) / 3) * 65,
                                            Math.cos((i * 2 * Math.PI) / 3 + (2 * Math.PI) / 3) * 65,
                                            Math.cos((i * 2 * Math.PI) / 3 + (4 * Math.PI) / 3) * 65,
                                            Math.cos((i * 2 * Math.PI) / 3 + 2 * Math.PI) * 65,
                                        ],
                                        y: [
                                            Math.sin((i * 2 * Math.PI) / 3) * 65,
                                            Math.sin((i * 2 * Math.PI) / 3 + (2 * Math.PI) / 3) * 65,
                                            Math.sin((i * 2 * Math.PI) / 3 + (4 * Math.PI) / 3) * 65,
                                            Math.sin((i * 2 * Math.PI) / 3 + 2 * Math.PI) * 65,
                                        ],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                />
                            ))}
                        </div>

                        {/* Brand name */}
                        <motion.div
                            className="flex flex-col items-center gap-1 mt-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h1 className="text-3xl font-bold tracking-tight">
                                <span className={`bg-gradient-to-r ${colors.gradientText} bg-clip-text text-transparent`}>
                                    pNode
                                </span>
                                <span className={`${colors.textPrimary} ml-1`}>Watch</span>
                            </h1>
                            <p className={`text-sm ${colors.textSecondary} tracking-wider uppercase`}>
                                Xandeum Network Analytics
                            </p>
                        </motion.div>

                        {/* Loading indicator - animated bars */}
                        <motion.div
                            className="flex items-center gap-1 mt-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            {[0, 1, 2, 3, 4].map((i) => (
                                <motion.div
                                    key={i}
                                    className={`w-1.5 bg-gradient-to-t ${colors.barGradient} rounded-full`}
                                    animate={{
                                        height: ['10px', '28px', '10px'],
                                    }}
                                    transition={{
                                        duration: 0.7,
                                        repeat: Infinity,
                                        delay: i * 0.1,
                                        ease: 'easeInOut',
                                    }}
                                />
                            ))}
                        </motion.div>

                        {/* Loading text */}
                        <motion.div
                            className={`flex items-center gap-1 ${colors.textLoading} text-sm mt-1`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <motion.span
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                Fetching network data
                            </motion.span>
                            <motion.span className="flex">
                                {[0, 1, 2].map((i) => (
                                    <motion.span
                                        key={i}
                                        animate={{ opacity: [0.2, 1, 0.2] }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            delay: i * 0.15,
                                        }}
                                    >
                                        .
                                    </motion.span>
                                ))}
                            </motion.span>
                        </motion.div>
                    </div>

                    {/* CSS for grid animation */}
                    <style jsx global>{`
                        @keyframes gridMove {
                            0% {
                                transform: translate(0, 0);
                            }
                            100% {
                                transform: translate(60px, 60px);
                            }
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
