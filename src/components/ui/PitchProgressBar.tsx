import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Trophy } from 'lucide-react';

interface PitchProgressBarProps {
    progress: number; // 0 to 100
    label?: string;
    className?: string;
}

export function PitchProgressBar({ progress, label, className }: PitchProgressBarProps) {
    return (
        <div className={cn("w-full mb-6", className)}>
            {label && (
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-lg font-bold text-falkirk-navy">{label}</h3>
                    <span className="text-sm font-bold text-celtic-green">{Math.round(progress)}% Completed</span>
                </div>
            )}

            {/* Pitch Container */}
            <div className="relative h-16 w-full bg-green-600 rounded-xl overflow-hidden shadow-inner border-2 border-white/20">

                {/* Pitch Markings (Pattern) */}
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(255,255,255,0.3)_20px,rgba(255,255,255,0.3)_40px)]" />
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-white/40 rounded-full" />

                {/* Progress Fill (Grass change? Or just player movement?) */}
                {/* Let's do a player movement indicator instead of a fill, or a fill that reveals the 'good' pitch */}
                <motion.div
                    className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-emerald-500 to-green-400 opacity-50"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />

                {/* The Player (Indicator) */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 flex flex-col items-center"
                    initial={{ left: '0%' }}
                    animate={{ left: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    {/* Player Icon */}
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-falkirk-navy shadow-lg flex items-center justify-center text-xl">
                            🏃‍♂️
                        </div>
                        {/* Tooltip on hover/active */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            Liam
                        </div>
                    </div>
                </motion.div>

                {/* Goal (Target) at 100% */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80">
                    <Trophy size={24} />
                </div>
            </div>
        </div>
    );
}
