import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { useTheme } from '../../hooks/useTheme';

interface DataItem {
    name: string;
    count: number;
}

interface ActivityTypeChartProps {
    data: DataItem[];
}

export const ActivityTypeChart = ({ data }: ActivityTypeChartProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Sort by count desc
    const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 7); // Top 7

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 shadow-xl rounded-lg text-sm">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{label}</p>
                    <p className="text-slate-500 dark:text-slate-400">Total: {payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="h-[350px] flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Actividades Frecuentes</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={sortedData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={140}
                            tick={{ fontSize: 11, fontWeight: 500, fill: isDark ? '#94a3b8' : '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip cursor={{ fill: isDark ? '#1e293b' : '#f8fafc' }} content={<CustomTooltip />} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24} fill="url(#barGradient)">
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
