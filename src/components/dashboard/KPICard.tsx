import { Card } from '../ui/Card';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    icon?: any;
    color?: 'blue' | 'green' | 'purple' | 'orange';
}

export const KPICard = ({ title, value, trend, icon: Icon, color = 'blue' }: KPICardProps) => {
    const colorStyles = {
        blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        green: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        purple: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
        orange: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    };

    return (
        <Card className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className={clsx("p-3 rounded-xl", colorStyles[color])}>
                    {Icon && <Icon className="w-6 h-6" />}
                </div>
                {trend && (
                    <div className={clsx(
                        "flex items-center text-xs font-semibold px-2 py-1 rounded-full",
                        trend.isPositive ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30" : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30"
                    )}>
                        {trend.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {Math.abs(trend.value)}%
                    </div>
                )}
            </div>

            <div className="mt-auto">
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{value}</p>
            </div>
        </Card>
    );
};
