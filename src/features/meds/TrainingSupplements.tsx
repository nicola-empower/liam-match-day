import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { FootballCard } from '../../components/ui/FootballCard';
import { requestNotificationPermission, sendNotification } from '../../services/notificationService';
import { Bell, BellOff } from 'lucide-react';

export function TrainingSupplements() {
    const { tasks, completeTask } = useGameStore();
    const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === 'granted');

    const medTasks = tasks.filter(t => t.category === 'meds');

    useEffect(() => {
        if (notificationsEnabled) {
            // Simulate scheduling a notification
            // In a real PWA this would be handled by service worker push events
            const timer = setTimeout(() => {
                // sendNotification("Half-Time Supplements", { body: "Take your 12:00 meds to stay match fit!" });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notificationsEnabled]);

    const enableNotifications = async () => {
        const granted = await requestNotificationPermission();
        setNotificationsEnabled(granted);
        if (granted) {
            sendNotification("Training Boosts Enabled", { body: "We'll remind you when it's time for your supplements." });
        }
    };

    return (
        <div className="pb-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-falkirk-navy">Supplements</h1>
                <button
                    onClick={enableNotifications}
                    className={`p-3 rounded-full ${notificationsEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                >
                    {notificationsEnabled ? <Bell /> : <BellOff />}
                </button>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl mb-8 border border-blue-100">
                <p className="text-sm text-blue-800">
                    <strong>Physio Note:</strong> Consistency is key for match readiness.
                    Make sure to take your supplements at the right time.
                </p>
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
