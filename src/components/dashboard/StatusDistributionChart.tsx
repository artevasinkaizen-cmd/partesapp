import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from '../ui/Card';

interface DataItem {
    name: string;
    value: number;
    color: string;
}

interface StatusDistributionChartProps {
    data: DataItem[];
}

export const StatusDistributionChart = ({ data }: StatusDistributionChartProps) => {
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 shadow-xl rounded-lg text-sm">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{payload[0].name}</p>
                    <p className="text-slate-500 dark:text-slate-400">
                        {payload[0].value} Partes ({((payload[0].value / data.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    // If no data, show placeholder
    if (data.every(d => d.value === 0)) {
        return (
            <Card className="h-[350px] flex items-center justify-center text-slate-400 dark:text-slate-500">
                No hay datos suficientes
            </Card>
        );
    }

    return (
        <Card className="h-[350px] flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Estado de los Partes</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data as any}
                            cx="50%"
                            cy="50%"
                            innerRadius={80} // Donut style
                            outerRadius={110}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="middle"
                            align="right"
                            layout="vertical"
                            iconType="circle"
                            wrapperStyle={{ right: 0 }}
                        />
                        {/* Center Label for Total */}
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-700 dark:fill-slate-200 text-3xl font-bold">
                            {data.reduce((a, b) => a + b.value, 0)}
                        </text>
                        <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-400 text-sm font-medium">
                            PARTES
                        </text>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
