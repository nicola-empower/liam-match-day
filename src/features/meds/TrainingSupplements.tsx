import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { FootballCard } from '../../components/ui/FootballCard';
import { addDailyReminder } from '../../services/syncService';
import { Bell, BellRing, Loader2, CheckCircle2 } from 'lucide-react';

export function TrainingSupplements() {
    const { tasks, completeTask } = useGameStore();

    const [remindersActive, setRemindersActive] = useState(() => {
        return localStorage.getItem('liam-med-reminders') === 'true';
    });
    const [isLoading, setIsLoading] = useState(false);

    const medTasks = tasks.filter(t => t.category === 'meds');

    const activateReminders = async () => {
        if (!confirm("Add daily reminders to your Google Calendar? (08:00 & 20:00)\n\nThis will open your existing calendar app via the cloud sync.")) return;

        setIsLoading(true);
        try {
            // Add 08:00 Reminder
            const success1 = await addDailyReminder("💊 Training Supplements", "08:00");

            // Add 20:00 Reminder
            const success2 = await addDailyReminder("🌙 Recovery Supplements", "20:00");

            if (success1 && success2) {
                setRemindersActive(true);
                localStorage.setItem('liam-med-reminders', 'true');
                alert("✅ Reminders added to your Google Calendar!");
            } else {
                alert("⚠️ Could not add reminders. Check your internet connection or try again.");
            }
        } catch (error) {
            console.error(error);
            alert("Error connecting to calendar service.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="pb-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-falkirk-navy">Supplements</h1>
                <button
                    onClick={activateReminders}
                    disabled={remindersActive || isLoading}
                    className={`p-3 rounded-full transition-all ${remindersActive
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : isLoading
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                    title={remindersActive ? "Reminders Active" : "Enable Daily Reminders"}
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" />
                    ) : remindersActive ? (
                        <CheckCircle2 />
                    ) : (
                        <BellRing />
                    )}
                </button>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl mb-8 border border-blue-100">
                <p className="text-sm text-blue-800">
                    <strong>Physio Note:</strong> Consistency is key for match readiness.
                    Make sure to take your supplements at the right time.
                </p>
                {!remindersActive && (
                    <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                        <Bell size={12} />
                        <span>Tap the bell above to add daily reminders to your calendar.</span>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {/* Morning Session */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">☀️</span>
                        <h2 className="text-xl font-bold text-gray-700">Morning Session (08:00)</h2>
                    </div>
                    {medTasks.filter(t => t.id.includes('8am')).map(task => (
                        <FootballCard
                            key={task.id}
                            title={task.title}
                            subtitle="Pre-match preparation"
                            points={task.points}
                            isCompleted={task.completed}
                            onComplete={() => completeTask(task.id)}
                            emoji={task.emoji}
                            colorClass={task.colorClass}
                        />
                    ))}
                </div>

                {/* Evening Session */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🌙</span>
                        <h2 className="text-xl font-bold text-gray-700">Recovery Session (20:00)</h2>
                    </div>
                    {medTasks.filter(t => t.id.includes('8pm')).map(task => (
                        <FootballCard
                            key={task.id}
                            title={task.title}
                            subtitle="Post-match recovery"
                            points={task.points}
                            isCompleted={task.completed}
                            onComplete={() => completeTask(task.id)}
                            emoji={task.emoji}
                            colorClass={task.colorClass}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
