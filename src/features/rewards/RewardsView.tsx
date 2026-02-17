import { useGameStore } from '../../store/useGameStore';
import { motion } from 'framer-motion';
import { Trophy, Gamepad2, Star, Shirt } from 'lucide-react';

export function RewardsView() {
    const { points } = useGameStore();

    const rewards = [
        { id: 1, title: '1 Hour Gaming', cost: 10, icon: Gamepad2, color: 'bg-blue-500' },
        { id: 2, title: 'Takeaway Night', cost: 500, icon: Star, color: 'bg-yellow-500' },
        { id: 3, title: 'New Falkirk Kit', cost: 50000, icon: Shirt, color: 'bg-falkirk-navy' },
    ];

    return (
        <div className="pb-20">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-falkirk-navy">Trophy Room</h1>
                <p className="text-gray-500">Spend your hard-earned points here.</p>
            </header>

            {/* Season Stats Card */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-falkirk-navy to-blue-900 rounded-2xl p-6 text-white shadow-xl mb-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy size={120} />
                </div>

                <div className="relative z-10">
                    <h2 className="text-sm font-bold uppercase tracking-widest opacity-80">Season Transfer Budget</h2>
                    <div className="text-6xl font-black mt-2">{points} <span className="text-2xl font-normal">pts</span></div>
                </div>
            </motion.div>

            {/* Rewards Grid */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">Available Contracts</h2>
            <div className="grid grid-cols-1 gap-4">
                {rewards.map((reward) => {
                    const canAfford = points >= reward.cost;
                    return (
                        <motion.div
                            key={reward.id}
                            whileTap={canAfford ? { scale: 0.98 } : {}}
                            className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-colors ${canAfford
                                ? 'bg-white border-gray-100 shadow-sm'
                                : 'bg-gray-50 border-gray-100 opacity-60 grayscale'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-full ${reward.color} flex items-center justify-center text-white shadow-sm`}>
                                <reward.icon size={24} />
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">{reward.title}</h3>
                                <p className="text-xs text-gray-500">{canAfford ? 'Available to unlock' : `Need ${reward.cost - points} more points`}</p>
                            </div>

                            <div className={`font-bold ${canAfford ? 'text-celtic-green' : 'text-gray-400'}`}>
                                {reward.cost} PTS
                            </div>

                            {canAfford && (
                                <button className="bg-celtic-green text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 active:scale-95 transition-all">
                                    Claim
                                </button>
                            )}
                        </motion.div>
                    )
                })}
            </div>
        </div>
    );
}
