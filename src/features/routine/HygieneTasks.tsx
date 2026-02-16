import { useGameStore } from '../../store/useGameStore';
import { FootballCard } from '../../components/ui/FootballCard';
import { PitchProgressBar } from '../../components/ui/PitchProgressBar';

export function HygieneTasks() {
    const { tasks, completeTask } = useGameStore();

    const routineTasks = tasks.filter(t => t.category === 'hygiene' || t.category === 'cleaning');
    const completedCount = routineTasks.filter(t => t.completed).length;
    const progress = routineTasks.length > 0 ? (completedCount / routineTasks.length) * 100 : 0;

    return (
        <div className="pb-20">
            <h1 className="text-3xl font-bold text-falkirk-navy mb-6">Training Session</h1>

            <PitchProgressBar progress={progress} label="Session Progress" />

            <div className="mt-8 space-y-4">
                {routineTasks.map(task => (
                    <FootballCard
                        key={task.id}
                        title={task.title}
                        points={task.points}
                        isCompleted={task.completed}
                        onComplete={() => completeTask(task.id)}
                        emoji={task.emoji}
                        colorClass={task.colorClass}
                    />
                ))}
            </div>
        </div>
    );
}
