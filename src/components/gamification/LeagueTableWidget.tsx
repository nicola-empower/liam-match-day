import { useGameStore } from '../../store/useGameStore';
import { Trophy, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export function LeagueTableWidget() {
    const { history, points, trophies, claimReward } = useGameStore();

    // Get last 7 days including today
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }
        return days;
    };

    const last7Days = getLast7Days();
    const today = new Date().toISOString().split('T')[0];

    // Calculate Streak
    // Count wins (points >= 20) going backwards from yesterday
    // If today is a win, add 1.
    let streak = 0;
    // Check days before today
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].points >= 20) streak++;
        else break;
    }
    // Check points right now for today (live streak)
    if (points >= 20) streak++;


    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                        <Award size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">League Table</h3>
                        <p className="text-xs text-gray-500">Target: 20 pts/day</p>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-yellow-500 font-black text-xl">
                        <Trophy size={20} /> x{trophies}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Trophies Won</span>
                </div>
            </div>

            {/* Form Guide (Wins/Losses) */}
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                {last7Days.map((date, idx) => {
                    const isToday = date === today;
                    // Find history for this date
                    const dayData = history.find(h => h.date === date);
                    // Determine status: 
                    // - Win (>20 pts)
                    // - Loss (<20 pts in history)
                    // - Pending (Today and <20 pts)
                    // - Unknown/Future (No history and not today)

                    let status: 'win' | 'loss' | 'pending' | 'unknown' = 'unknown';

                    if (isToday) {
                        status = points >= 20 ? 'win' : 'pending';
                    } else if (dayData) {
                        status = dayData.points >= 20 ? 'win' : 'loss';
                    } else {
                        // No data for past day -> Assume loss (didn't play)
                        status = 'loss';
                    }

                    return (
                        <div key={idx} className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">
                                {new Date(date).toLocaleDateString(undefined, { weekday: 'narrow' })}
                            </span>
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm transition-all
                                ${status === 'win' ? 'bg-emerald-500' : ''}
                                ${status === 'loss' ? 'bg-red-400 opacity-50' : ''}
                                ${status === 'pending' ? 'bg-gray-200 text-gray-400 border-2 border-dashed border-gray-300' : ''}
                            `}>
                                {status === 'win' && 'W'}
                                {status === 'loss' && 'L'}
                                {status === 'pending' && <div className="text-[10px] text-gray-400">...</div>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Streak & Claim */}
            <div className="flex items-center gap-4">
                <div className="flex-1 bg-falkirk-navy/5 p-3 rounded-xl flex items-center gap-3">
                    <div className="text-2xl">🔥</div>
                    <div>
                        <div className="font-black text-xl text-falkirk-navy">{streak}</div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase">Day Streak</div>
                    </div>
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={claimReward}
                    disabled={points < 20}
                    className={`
                        flex-1 py-3 px-4 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all
                        ${points >= 20
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-yellow-200 ring-2 ring-yellow-200 ring-offset-2'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                    `}
                >
                    <Trophy size={16} />
                    {points >= 20 ? 'CLAIM TROPHY!' : 'Get 20 Pts to Claim'}
                </motion.button>
            </div>
        </div>
    );
}
