import { useEffect, useState } from 'react';
import { PitchProgressBar } from '../../components/ui/PitchProgressBar';
import { FootballCard } from '../../components/ui/FootballCard';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { RedCardWidget } from '../../components/health/RedCardWidget';
import { FormGuideWidget, WeatherWidget, TeamTalkWidget } from '../../components/gamification/Widgets';
import { getUpcomingMatches, getMatchDetails, type MatchDetails, type Match } from '../../services/footballApi';
import { Shirt, Info, X, Cloud, CloudOff } from 'lucide-react';
import { isSyncEnabled } from '../../services/syncService';

export function MatchDayView() {
    const { tasks, points, completeTask, uncompleteTask, syncFromCloud, isSyncing, lastSynced } = useGameStore();
    const [matches, setMatches] = useState<Match[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<MatchDetails | null>(null);

    useEffect(() => {
        getUpcomingMatches().then(setMatches);
        // Sync from cloud on load
        syncFromCloud();
    }, []);

    const openMatchCentre = async (match: Match) => {
        const details = await getMatchDetails(match.id);
        setSelectedMatch(details || match);
    };

    // Calculate progress
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const progressPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    return (
        <div className="flex flex-col gap-8 pb-20 relative">
            {/* Header / Scoreboard */}
            <motion.header
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-falkirk-navy">Stadium Entrance</h1>
                        <p className="text-gray-500 flex items-center gap-1">
                            Points this season: <span className="font-bold text-celtic-green">{points}</span>
                            {isSyncing ? (
                                <span className="text-xs text-blue-400 ml-2 flex items-center gap-1"><Cloud size={12} className="animate-pulse" /> Syncing...</span>
                            ) : isSyncEnabled() && lastSynced ? (
                                <span className="text-xs text-green-500 ml-2 flex items-center gap-1"><Cloud size={12} /> Cloud saved</span>
                            ) : isSyncEnabled() ? (
                                <span className="text-xs text-gray-400 ml-2 flex items-center gap-1"><CloudOff size={12} /> Not synced</span>
                            ) : (
                                <span className="text-xs text-green-500 ml-2">✓ Auto-saved</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Match Carousel */}
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                    {matches.length > 0 ? matches.map(match => (
                        <div key={match.id} className="min-w-[280px] snap-center bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col gap-2 relative group hover:border-celtic-green transition-colors cursor-pointer" onClick={() => openMatchCentre(match)}>
                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                                <span>{match.league}</span>
                                <span className={match.status === 'LIVE' ? 'text-red-500 animate-pulse' : ''}>{match.status === 'LIVE' ? 'LIVE' : new Date(match.kickoffTime).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center my-2">
                                <span className="font-black text-lg text-falkirk-navy">{match.homeTeam}</span>
                                <span className="text-sm font-bold bg-gray-200 px-2 py-1 rounded text-gray-600">VS</span>
                                <span className="font-black text-lg text-falkirk-navy">{match.awayTeam}</span>
                            </div>
                            <div className="text-center text-sm font-medium text-celtic-green flex items-center justify-center gap-1 group-hover:underline">
                                <Info size={14} /> Match Centre
                            </div>
                        </div>
                    )) : (
                        <div className="text-gray-400 p-4 w-full text-center italic">Scouting for upcoming fixtures...</div>
                    )}
                </div>
            </motion.header>

            {/* Match Centre Modal */}
            {selectedMatch && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMatch(null)}>
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        className="bg-white w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={() => setSelectedMatch(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} /></button>

                        <h2 className="text-2xl font-black text-center mb-1 text-falkirk-navy">{selectedMatch.homeTeam} vs {selectedMatch.awayTeam}</h2>
                        <p className="text-center text-gray-500 font-medium mb-6">{selectedMatch.league} • {new Date(selectedMatch.kickoffTime).toLocaleString()}</p>

                        <div className="space-y-6">
                            {/* Lineups Section */}
                            {selectedMatch.lineups && selectedMatch.lineups.length > 0 ? (
                                <div>
                                    <h3 className="flex items-center gap-2 font-bold text-lg mb-3 border-b pb-2"><Shirt size={20} /> Starting Lineups</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {selectedMatch.lineups.map((lineup, i) => (
                                            <div key={i}>
                                                <div className="font-bold mb-2 text-celtic-green">{lineup.team.name} <span className="text-xs text-gray-400 font-normal">({lineup.formation})</span></div>
                                                <ul className="space-y-1">
                                                    {lineup.startXI.map((p, idx) => (
                                                        <li key={idx} className="flex gap-2">
                                                            <span className="text-gray-400 w-4 text-right">{p.number}</span>
                                                            <span className="font-medium">{p.name}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <Shirt className="mx-auto text-gray-300 mb-2" size={32} />
                                    <p className="text-gray-500">Lineups not yet announced.</p>
                                    <p className="text-xs text-gray-400">Usually available 1 hour before kickoff.</p>
                                </div>
                            )}

                            {/* Venue Info */}
                            {selectedMatch.venue && (
                                <div className="text-center text-sm text-gray-500 mt-4 bg-gray-50 p-3 rounded-lg">
                                    🏟️ Played at <span className="font-bold">{selectedMatch.venue.name}</span>, {selectedMatch.venue.city}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Widgets Row */}
            <section className="grid grid-cols-2 gap-4">
                <WeatherWidget />
                <FormGuideWidget />
                <div className="col-span-2">
                    <RedCardWidget />
                </div>
                <div className="col-span-2">
                    <TeamTalkWidget />
                </div>
            </section>

            {/* Daily Progress */}
            <section>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Training Ground</h2>
                <PitchProgressBar progress={progressPercentage} label="Daily Session" />
            </section>

            {/* Daily Sessions */}
            <div className="space-y-8">
                {/* Morning Session */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🌅</span>
                        <h2 className="text-2xl font-bold text-gray-800">Morning Session</h2>
                    </div>
                    <div className="flex flex-col">
                        {tasks.filter(t => t.timeOfDay === 'morning').map((task) => (
                            <FootballCard
                                key={task.id}
                                title={task.title}
                                points={task.points}
                                isCompleted={task.completed}
                                onComplete={() => completeTask(task.id)}
                                onUndo={() => uncompleteTask(task.id)}
                                emoji={task.emoji}
                                colorClass={task.colorClass}
                            />
                        ))}
                    </div>
                </section>

                {/* Evening Session */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🌙</span>
                        <h2 className="text-2xl font-bold text-gray-800">Evening Recovery</h2>
                    </div>
                    <div className="flex flex-col">
                        {tasks.filter(t => t.timeOfDay === 'evening').map((task) => (
                            <FootballCard
                                key={task.id}
                                title={task.title}
                                points={task.points}
                                isCompleted={task.completed}
                                onComplete={() => completeTask(task.id)}
                                onUndo={() => uncompleteTask(task.id)}
                                emoji={task.emoji}
                                colorClass={task.colorClass}
                            />
                        ))}
                    </div>
                </section>

                {/* Extra Time (Anytime Tasks) */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">⏱️</span>
                        <h2 className="text-2xl font-bold text-gray-800">Extra Time (Anytime)</h2>
                    </div>
                    <div className="flex flex-col">
                        {tasks.filter(t => t.timeOfDay === 'anytime').map((task) => (
                            <FootballCard
                                key={task.id}
                                title={task.title}
                                points={task.points}
                                isCompleted={task.completed}
                                onComplete={() => completeTask(task.id)}
                                onUndo={() => uncompleteTask(task.id)}
                                emoji={task.emoji}
                                colorClass={task.colorClass}
                            />
                        ))}
                    </div>
                </section>
            </div>

            {/* PlayStation Contract Status */}
            <section className="bg-gray-900 text-white p-6 rounded-2xl mt-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold">PlayStation Contract</h3>
                    <span className="text-xs font-mono bg-white/20 px-2 py-1 rounded">CLAUSE 4.2</span>
                </div>
                <div className="flex justify-between items-end">
                    <div className="text-gray-400 text-sm">Target: 20 Points</div>
                    <div className="text-3xl font-bold text-yellow-400">{points} / 20</div>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                        className="bg-yellow-400 h-full transition-all duration-1000"
                        style={{ width: `${Math.min((points / 20) * 100, 100)}%` }}
                    />
                </div>
                {points >= 20 ? (
                    <div className="mt-4 bg-green-500/20 text-green-400 p-3 rounded-lg text-center font-bold border border-green-500/50 animate-pulse">
                        ✅ CONTRACT UNLOCKED: 2 HOURS GAMING
                    </div>
                ) : (
                    <div className="mt-4 text-center text-sm text-gray-500">
                        Complete {Math.ceil((20 - points) / 3)} more tasks to unlock
                    </div>
                )}
            </section>
        </div>
    );
}
