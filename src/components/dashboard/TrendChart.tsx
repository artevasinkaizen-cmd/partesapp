import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { useTheme } from '../../hooks/useTheme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DataItem {
    date: string; // ISO date or formatted
    count: number;
}

interface TrendChartProps {
    data: DataItem[];
}

export const TrendChart = ({ data }: TrendChartProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 shadow-xl rounded-lg text-sm">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {format(new Date(label), "d MMM yyyy", { locale: es })}
                    </p>
                    <p className="text-blue-500 font-bold">
                        {payload[0].value} Actuaciones
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="h-[350px] flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Tendencia de Actividad</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => format(new Date(value), "d MMM", { locale: es })}
                            tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            hide
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorCount)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
