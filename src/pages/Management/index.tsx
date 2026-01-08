import { useState, useMemo } from 'react';
import { useUserStore } from '../../hooks/useUserStore';
import { ParteCard } from '../../components/management/ParteCard';
import { KanbanBoard } from '../../components/management/KanbanBoard';
import { ManagementFilters } from '../../components/management/ManagementFilters';
import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Management() {
    const navigate = useNavigate();
    const { partes } = useUserStore();
    const [search, setSearch] = useState('');
    const [view, setView] = useState<'list' | 'kanban'>('list');

    const filteredPartes = useMemo(() => {
        return partes.filter(p =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.createdBy.toLowerCase().includes(search.toLowerCase())
        );
    }, [partes, search]);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Gestión de Partes</h1>
                <Button onClick={() => navigate('/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Parte
                </Button>
            </div>

            <ManagementFilters
                search={search}
                onSearchChange={setSearch}
                view={view}
                onViewChange={setView}
            />

            <div className="flex-1 overflow-auto min-h-0">
                {view === 'list' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPartes.map(parte => (
                            <ParteCard key={parte.id} parte={parte} />
                        ))}
                        {filteredPartes.length === 0 && (
                            <div className="col-span-full text-center py-12 text-slate-500">
                                No se encontraron partes.
                            </div>
                        )}
                    </div>
                ) : (
                    <KanbanBoard partes={filteredPartes} />
                )}
            </div>
        </div>
    );
}
