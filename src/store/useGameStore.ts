import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { debouncedPush, fetchFromSheet, type CalendarEvent } from '../services/syncService';

interface Task {
    id: string;
    title: string;
    points: number;
    completed: boolean;
    category: 'hygiene' | 'cleaning' | 'meds' | 'other';
    emoji?: string;
    colorClass?: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
}

interface GameState {
    points: number;
    tasks: Task[];
    addPoints: (amount: number) => void;
    completeTask: (taskId: string) => void;
    uncompleteTask: (taskId: string) => void;
    history: { date: string; points: number }[];
    resetDailyTasks: () => void;
    seizureHistory: { date: string; count: number }[];
    logSeizure: (amount: number) => void;
    // Cloud sync
    // Cloud sync
    calendarEvents: CalendarEvent[];
    lastSynced: string | null;
    isSyncing: boolean;
    syncFromCloud: () => Promise<void>;
    // Gamification
    trophies: number;
    claimReward: () => void;
}

const INITIAL_TASKS: Task[] = [
    // ... existing tasks ...
    // Morning Session
    { id: 'shower-morning', title: 'Morning Shower', points: 3, completed: false, category: 'hygiene', emoji: '🚿', colorClass: 'bg-falkirk-navy', timeOfDay: 'morning' },
    { id: 'teeth-morning', title: 'Brush Teeth', points: 2, completed: false, category: 'hygiene', emoji: '🪥', colorClass: 'bg-blue-500', timeOfDay: 'morning' },
    { id: 'meds-8am', title: '08:00 Training Supplements', points: 5, completed: false, category: 'meds', emoji: '💊', colorClass: 'bg-celtic-green', timeOfDay: 'morning' },
    { id: 'leave-on-time', title: 'Leave for College On Time', points: 10, completed: false, category: 'other', emoji: '🚌', colorClass: 'bg-yellow-500', timeOfDay: 'morning' },

    // Evening Session
    { id: 'shower-evening', title: 'Post-Match Shower', points: 3, completed: false, category: 'hygiene', emoji: '🚿', colorClass: 'bg-falkirk-navy', timeOfDay: 'evening' },
    { id: 'teeth-evening', title: 'Brush Teeth', points: 2, completed: false, category: 'hygiene', emoji: '🪥', colorClass: 'bg-blue-500', timeOfDay: 'evening' },
    { id: 'meds-8pm', title: '20:00 Recovery Supplements', points: 5, completed: false, category: 'meds', emoji: '🌙', colorClass: 'bg-indigo-800', timeOfDay: 'evening' },
    { id: 'laundry', title: 'Wash Kit (Clothes)', points: 8, completed: false, category: 'cleaning', emoji: '👕', colorClass: 'bg-blue-400', timeOfDay: 'evening' },
    { id: 'kitchen', title: 'Clean Kitchen', points: 8, completed: false, category: 'cleaning', emoji: '✨', colorClass: 'bg-emerald-500', timeOfDay: 'evening' },
    { id: 'dishes', title: 'Wash Dishes', points: 5, completed: false, category: 'cleaning', emoji: '🍽️', colorClass: 'bg-teal-500', timeOfDay: 'evening' },
    { id: 'clean-room', title: 'Kit Room Inspection', points: 5, completed: false, category: 'cleaning', emoji: '🛏️', colorClass: 'bg-orange-500', timeOfDay: 'evening' },
    { id: 'dinner', title: 'Cook Team Dinner', points: 20, completed: false, category: 'cleaning', emoji: '👨‍🍳', colorClass: 'bg-red-500', timeOfDay: 'evening' },

    // Anytime / Other
    { id: 'floors', title: 'Clean Floors', points: 10, completed: false, category: 'cleaning', emoji: '🧹', colorClass: 'bg-amber-600', timeOfDay: 'anytime' },
    { id: 'bins', title: 'Take Bins Out', points: 5, completed: false, category: 'cleaning', emoji: '🗑️', colorClass: 'bg-gray-600', timeOfDay: 'anytime' },
];

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            points: 0,
            tasks: INITIAL_TASKS,
            history: [],
            seizureHistory: [],
            calendarEvents: [],
            lastSynced: null,
            isSyncing: false,
            trophies: 0,

            addPoints: (amount) => set((state) => ({ points: state.points + amount })),

            completeTask: (taskId) => set((state) => {
                const task = state.tasks.find(t => t.id === taskId);
                if (task && !task.completed) {
                    return {
                        tasks: state.tasks.map(t => t.id === taskId ? { ...t, completed: true } : t),
                        points: state.points + task.points
                    };
                }
                return state;
            }),

            uncompleteTask: (taskId) => set((state) => {
                const task = state.tasks.find(t => t.id === taskId);
                if (task && task.completed) {
                    return {
                        tasks: state.tasks.map(t => t.id === taskId ? { ...t, completed: false } : t),
                        points: Math.max(0, state.points - task.points)
                    };
                }
                return state;
            }),

            logSeizure: (amount) => set((state) => {
                const today = new Date().toISOString().split('T')[0];
                const existingEntryIndex = state.seizureHistory.findIndex(h => h.date === today);

                const newHistory = [...state.seizureHistory];
                if (existingEntryIndex >= 0) {
                    const newCount = Math.max(0, newHistory[existingEntryIndex].count + amount);
                    newHistory[existingEntryIndex] = { ...newHistory[existingEntryIndex], count: newCount };
                } else if (amount > 0) {
                    newHistory.push({ date: today, count: amount });
                }

                return { seizureHistory: newHistory };
            }),

            resetDailyTasks: () => set((state) => {
                const today = new Date().toISOString().split('T')[0];
                const newHistory = [...state.history, { date: today, points: state.points }];
                if (newHistory.length > 5) newHistory.shift();

                const seizureEntry = state.seizureHistory.find(h => h.date === today);
                const newSeizureHistory = [...state.seizureHistory];
                if (!seizureEntry) {
                    newSeizureHistory.push({ date: today, count: 0 });
                }

                return {
                    tasks: INITIAL_TASKS,
                    points: 0,
                    history: newHistory,
                    seizureHistory: newSeizureHistory
                };
            }),

            claimReward: () => set((state) => {
                if (state.points >= 20) {
                    return {
                        points: state.points - 20,
                        trophies: state.trophies + 1
                    };
                }
                return state;
            }),

            // Cloud sync: pull data from Google Sheet
            syncFromCloud: async () => {
                set({ isSyncing: true });
                try {
                    const cloudData = await fetchFromSheet();
                    if (cloudData) {
                        const today = new Date().toISOString().split('T')[0];
                        const currentState = get();

                        // Merge tasks: if cloud has today's tasks with completion data, use those
                        let mergedTasks = currentState.tasks;
                        if (cloudData.tasks && cloudData.tasks.length > 0) {
                            const cloudTaskMap = new Map(
                                cloudData.tasks
                                    .filter((t: any) => t.date === today)
                                    .map((t: any) => [t.taskId, t.completed])
                            );

                            if (cloudTaskMap.size > 0) {
                                mergedTasks = currentState.tasks.map(task => ({
                                    ...task,
                                    // True Wins: If either local OR cloud is true, consider it done.
                                    // This prevents stale cloud data (false) from overwriting offline progress (true).
                                    completed: task.completed || (cloudTaskMap.has(task.id) && Boolean(cloudTaskMap.get(task.id)))
                                }));
                            }
                        }

                        // Recalculate points from completed tasks
                        const points = mergedTasks
                            .filter(t => t.completed)
                            .reduce((sum, t) => sum + t.points, 0);

                        set({
                            tasks: mergedTasks,
                            points,
                            calendarEvents: cloudData.calendarEvents || [],
                            seizureHistory: cloudData.seizureHistory?.length > 0
                                ? cloudData.seizureHistory
                                : currentState.seizureHistory,
                            history: cloudData.pointsHistory?.length > 0
                                ? cloudData.pointsHistory
                                : currentState.history,
                            lastSynced: new Date().toISOString(),
                            isSyncing: false
                        });
                    } else {
                        set({ isSyncing: false });
                    }
                } catch (error) {
                    console.error('[Store] Cloud sync failed:', error);
                    set({ isSyncing: false });
                }
            },
        }),
        {
            name: 'liam-game-storage-v3',
            partialize: (state) => ({
                // Only persist these keys to localStorage (not sync metadata)
                points: state.points,
                tasks: state.tasks,
                history: state.history,
                seizureHistory: state.seizureHistory,
                calendarEvents: state.calendarEvents,
                lastSynced: state.lastSynced,
                trophies: state.trophies,
            }),
        }
    )
);

// ========== AUTO SYNC ==========
// Subscribe to state changes and push to sheet (debounced)
useGameStore.subscribe((state) => {
    // Don't push while we are pulling from cloud to avoid overwriting
    if (!state.isSyncing) {
        debouncedPush({
            tasks: state.tasks,
            points: state.points,
            seizureHistory: state.seizureHistory,
            history: state.history,
        });
    }
});
