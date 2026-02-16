import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { CheckCircle2, Undo2 } from 'lucide-react';

export interface FootballCardProps {
    title: string;
    subtitle?: string;
    isCompleted?: boolean;
    points?: number;
    onComplete?: () => void;
    onUndo?: () => void;
    className?: string;
    emoji?: string;
    colorClass?: string;
}

export function FootballCard({
    title,
    subtitle,
    isCompleted,
    points = 3,
    onComplete,
    onUndo,
    className,
    emoji = '⚽',
    colorClass = 'bg-falkirk-navy'
}: FootballCardProps) {

    // Completed State Design
    if (isCompleted) {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "bg-green-100 border-2 border-celtic-green rounded-2xl p-4 flex items-center justify-between mb-4 shadow-sm opacity-80",
                    className
                )}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-celtic-green rounded-full flex items-center justify-center text-white">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 line-through decoration-celtic-green/50 decoration-2">{title}</h3>
                        <p className="text-xs text-green-700 font-bold">COMPLETED (+{points} PTS)</p>
                    </div>
                </div>
                {onUndo && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onUndo(); }}
                        className="p-2 bg-white border border-gray-200 rounded-full hover:bg-red-50 hover:border-red-300 transition-colors group/undo"
                        title="Undo"
                    >
                        <Undo2 size={16} className="text-gray-400 group-hover/undo:text-red-500" />
                    </button>
                )}
            </motion.div>
        );
    }

    // Active State "Hero Button" Design
    return (
        <motion.button
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={onComplete}
            className={cn(
                "w-full text-white p-6 rounded-2xl text-left shadow-lg relative overflow-hidden group mb-4 transition-all hover:shadow-xl border-b-4 border-black/10",
                colorClass,
                className
            )}
        >
            {/* Background Icon Effect */}
            <div className="absolute right-[-10px] top-[-10px] opacity-10 text-9xl group-hover:scale-110 group-hover:rotate-12 transition-transform select-none pointer-events-none">
                {emoji}
            </div>

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <span className="block text-4xl mb-3 filter drop-shadow-sm">{emoji}</span>
                    <h3 className="font-black text-2xl leading-tight mb-1">{title}</h3>
                    {subtitle && <p className="text-white/80 font-medium text-sm">{subtitle}</p>}
                </div>

                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg font-black text-sm border border-white/30">
                    +{points} PTS
                </div>
            </div>

            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Tap to Complete
            </div>
        </motion.button>
    );
}
