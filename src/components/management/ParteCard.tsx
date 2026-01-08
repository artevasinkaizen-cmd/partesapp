import { useNavigate } from 'react-router-dom';
import type { Parte } from '../../types';
import { Badge } from '../ui/Badge';
import { Clock, List } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ParteCardProps {
    parte: Parte;
}

export const ParteCard = ({ parte }: ParteCardProps) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/parte/${parte.id}`)}
            className="glass-card p-4 rounded-xl transition-all cursor-pointer group hover:-translate-y-1"
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">#{parte.id}</span>
                <Badge
                    variant={
                        parte.status === 'ABIERTO' ? 'success' :
                            parte.status === 'EN TRÁMITE' ? 'info' : 'danger'
                    }
                >
                    {parte.status}
                </Badge>
            </div>

            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {parte.title}
            </h3>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4">
                <span className="truncate max-w-[100px]">{parte.createdBy}</span>
                <span className="flex items-center gap-1">
                    {format(new Date(parte.createdAt), "d MMM", { locale: es })}
                </span>
            </div>

            <div className="border-t border-slate-100 dark:border-white/10 mt-3 pt-3 flex gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {parte.totalTime} min
                </div>
                <div className="flex items-center gap-1">
                    <List className="w-3 h-3" />
                    {parte.totalActuaciones}
                </div>
            </div>
        </div>
    );
};
