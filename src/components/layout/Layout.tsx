import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout = () => {
    return (
        <div className="min-h-screen transition-colors duration-300">
            <Sidebar />
            <main className="pl-64 transition-all duration-300">
                <div className="mx-auto max-w-[90%] p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
