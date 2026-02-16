import { Home, ClipboardList, Trophy, MapPin, Pill } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { icon: Home, label: 'Stadium', path: '/' },
    { icon: ClipboardList, label: 'Training', path: '/routine' },
    { icon: MapPin, label: 'Away Days', path: '/travel' },
    { icon: Pill, label: 'Meds', path: '/meds' },
    { icon: Trophy, label: 'Trophies', path: '/rewards' },
];

export function Sidebar() {
    return (
        <nav className="fixed left-0 top-0 h-full w-24 bg-falkirk-navy flex flex-col items-center py-6 shadow-xl z-50 border-r-4 border-celtic-green">
            {/* Club Crest / Logo */}
            <div className="mb-8 p-2 rounded-full bg-white shadow-lg">
                <div className="w-12 h-12 rounded-full bg-celtic-green flex items-center justify-center text-white font-bold text-xl">
                    LFC
                </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 flex flex-col gap-6 w-full px-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 text-white/70 hover:text-white hover:bg-white/10 ${isActive ? 'bg-celtic-green text-white shadow-md scale-110' : ''}`
                        }
                    >
                        <item.icon size={28} strokeWidth={2.5} />
                        <span className="text-xs font-bold mt-1 tracking-wide">{item.label}</span>

                        {/* Active Indicator Dot */}
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white opacity-0 transition-opacity duration-300" />
                    </NavLink>
                ))}
            </div>

            {/* Settings / Profile at bottom */}
            <div className="mt-auto mb-4">
                <button className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 border-2 border-white" />
                </button>
            </div>
        </nav>
    );
}
