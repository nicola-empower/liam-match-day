import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function LeftHandLayout() {
    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            {/* Sidebar - Fixed Left */}
            <Sidebar />

            {/* Main Content Area */}
            {/* ml-24 accounts for the sidebar width */}
            <main className="flex-1 ml-24 h-full overflow-y-auto p-6 md:p-8">
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
