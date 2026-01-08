import { Search } from 'lucide-react';
import { Input } from '../ui/Input';

interface ManagementFiltersProps {
    search: string;
    onSearchChange: (val: string) => void;
    view: 'list' | 'kanban';
    onViewChange: (val: 'list' | 'kanban') => void;
}

export const ManagementFilters = ({ search, onSearchChange, view, onViewChange }: ManagementFiltersProps) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    placeholder="Buscar por título, usuario..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                <button
                    onClick={() => onViewChange('list')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'list' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    Lista
                </button>
                <button
                    onClick={() => onViewChange('kanban')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'kanban' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    Kanban
                </button>
            </div>
        </div>
    );
};
