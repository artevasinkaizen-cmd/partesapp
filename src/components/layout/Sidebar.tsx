import { LayoutDashboard, FileText, PlusCircle, LogOut, Search, Moon, Sun } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import clsx from 'clsx';
import logoUrl from '../../assets/logo.png';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../hooks/useTheme';

const API_NAV_ITEMS = [
    { label: 'Panel de Control', icon: LayoutDashboard, to: '/' },
    { label: 'Gestión de Partes', icon: FileText, to: '/management' },
    { label: 'Nuevo Parte', icon: PlusCircle, to: '/new' },
    { label: 'Explorador Global', icon: Search, to: '/global' },
];

export const Sidebar = () => {
    const { currentUser, logoutUser } = useAppStore();
    const { theme, toggleTheme } = useTheme();

    return (
        <>
            <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/20 shadow-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl z-30 transition-transform duration-300 flex flex-col">
                <div className="flex h-24 items-center justify-center border-b border-white/10 dark:border-white/5 px-6 py-4">
                    <Link to="/" className="block w-full flex justify-center">
                        <img
                            src={logoUrl}
                            alt="PartesApp Logo"
                            className="h-16 w-auto max-w-full object-contain mix-blend-multiply dark:mix-blend-screen hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                        />
                    </Link>
                </div>

                <nav className="p-4 space-y-2 mt-4 flex-1">
                    {API_NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                clsx(
                                    'flex items-center gap-3 rounded-full px-5 py-3.5 text-sm font-medium transition-all duration-300 group relative overflow-hidden',
                                    {
                                        'bg-blue-600/10 text-blue-700 dark:text-blue-300 shadow-sm': isActive,
                                        'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-slate-200 hover:shadow-md hover:-translate-y-0.5': !isActive,
                                    }
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={clsx("h-5 w-5 transition-transform duration-300 group-hover:rotate-6", { "text-blue-600 dark:text-blue-400": isActive })} />
                                    <span className="relative z-10">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 dark:border-white/5 bg-white/10 dark:bg-slate-900/20 backdrop-blur-sm">
                    <button
                        onClick={toggleTheme}
                        className="flex w-full items-center gap-3 mb-3 px-4 py-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10 transition-all hover:shadow-sm"
                    >
                        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        <span className="text-sm font-medium">Modo {theme === 'light' ? 'Oscuro' : 'Claro'}</span>
                    </button>

                    <div
                        onClick={() => window.location.href = '/profile'}
                        className="flex items-center gap-3 mb-3 px-3 py-2 -mx-1 rounded-xl hover:bg-white/40 dark:hover:bg-white/10 cursor-pointer transition-colors group border border-transparent hover:border-white/20"
                        title="Ir a mi perfil"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
                            {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                                {currentUser?.name || 'Usuario'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate opacity-80">
                                {currentUser?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={logoutUser}
                        className="flex w-full items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>
        </>
    );
};
