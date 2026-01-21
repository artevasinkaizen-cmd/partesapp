import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-950">
            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-white/20 px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <span className="font-display font-bold text-lg text-slate-800 dark:text-slate-100">PartesApp</span>
                <div className="w-8" /> {/* Spacer for balance */}
            </div>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="md:pl-64 transition-all duration-300 ease-in-out">
                {/* On mobile, remove huge padding to max-width to use full screen real estate */}
                <div className="mx-auto w-full md:max-w-[95%] p-4 md:p-8 pb-24 md:pb-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
