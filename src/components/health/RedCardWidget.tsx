import { useGameStore } from "../../store/useGameStore";
import { Plus, Minus, Activity } from 'lucide-react';

export function RedCardWidget() {
    const { seizureHistory, logSeizure } = useGameStore();

    const today = new Date().toISOString().split('T')[0];
    const todaysEntry = seizureHistory.find(h => h.date === today);
    const count = todaysEntry ? todaysEntry.count : 0;

    // Get last 5 days for graph
    const historyGraph = seizureHistory.slice(-5);

    return (
        <div className="bg-red-50 p-4 rounded-2xl shadow-sm border border-red-100 flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-red-800 text-sm font-bold uppercase tracking-wider">
                    <div className="bg-red-600 text-white p-1 rounded">
                        <div className="h-4 w-3 bg-red-600 border border-white/20"></div>
                    </div>
                    <span>Red Card Report</span>
                </div>
                <Activity size={16} className="text-red-300" />
            </div>

            {/* Counter */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => logSeizure(-1)}
                    className="w-10 h-10 rounded-full bg-white border border-red-200 text-red-600 flex items-center justify-center hover:bg-red-100 active:scale-95 transition-all"
                >
                    <Minus size={20} />
                </button>

                <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-red-600">{count}</span>
                    <span className="text-xs font-bold text-red-400 uppercase">Seizures Today</span>
                </div>

                <button
                    onClick={() => logSeizure(1)}
                    className="w-10 h-10 rounded-full bg-red-600 text-white shadow-md shadow-red-200 flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Mini History Graph */}
            {seizureHistory.length > 0 && (
                <div className="flex items-end justify-between h-8 mt-2 gap-1 opacity-70">
                    {historyGraph.map((entry, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 w-full">
                            <div
                                className="w-full bg-red-300 rounded-t-sm min-h-[4px]"
                                style={{ height: `${Math.min(entry.count * 10, 100)}%` }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {count > 0 && (
                <div className="text-xs text-center text-red-500 font-medium">
                    "Take it easy, gaffer."
                </div>
            )}
        </div>
    );
}
