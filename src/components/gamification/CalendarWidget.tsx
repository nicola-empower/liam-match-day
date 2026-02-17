import { useGameStore } from '../../store/useGameStore';
import { Calendar, Clock, MapPin } from 'lucide-react';

export function CalendarWidget() {
    const { calendarEvents } = useGameStore();

    // Sort events by date
    const sortedEvents = [...calendarEvents]
        .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime())
        // Filter out past events (optional, but good for "Upcoming")
        // Filter out past events (optional, but good for "Upcoming")
        .filter(e => {
            const eventTime = new Date(`${e.date}T${e.startTime || '00:00'}`);
            const now = new Date();
            // Keep events from today onwards
            if (eventTime.setHours(23, 59, 59) < now.getTime()) return false;

            // Filter out generic "Medication" events (duplicates of Training/Recovery Supplements)
            if (e.title === 'Medication') return false;

            return true;
        })
        .slice(0, 5); // Show top 5

    if (sortedEvents.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Calendar size={20} />
                </div>
                <h3 className="font-bold text-gray-800">Liam's Schedule</h3>
            </div>

            <div className="space-y-3">
                {sortedEvents.map((event, idx) => {
                    const isToday = new Date(event.date).toLocaleDateString() === new Date().toLocaleDateString();
                    return (
                        <div key={idx} className={`p-3 rounded-xl border ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'} flex flex-col gap-1`}>
                            <div className="flex justify-between items-start">
                                <span className={`font-bold ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>{event.title}</span>
                                {isToday && <span className="bg-blue-200 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">TODAY</span>}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Clock size={12} />
                                    <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {event.startTime}</span>
                                </div>
                                {event.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin size={12} />
                                        <span>{event.location.split(',')[0]}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
