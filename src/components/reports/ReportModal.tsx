import { useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { generatePdfReport } from '../../utils/pdfGenerator';
import { StatusDistributionChart } from '../dashboard/StatusDistributionChart';
import { ActivityTypeChart } from '../dashboard/ActivityTypeChart';
import { TrendChart } from '../dashboard/TrendChart';
import { Button } from '../ui/Button';
import { X, Calendar as CalendarIcon, Download, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import html2canvas from 'html2canvas';

// Custom Web Component wrapper for Calendar
// @ts-nocheck
import 'cally';
import { CalendarWithSelectors } from '../ui/CalendarWithSelectors';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ReportModal = ({ isOpen, onClose }: ReportModalProps) => {
    const { partes } = useAppStore();
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    const [isGenerating, setIsGenerating] = useState(false);

    const chartsRef = useRef<HTMLDivElement>(null);

    // Filter logic for preview
    const filteredPartes = partes.filter(p => {
        const pDate = new Date(p.createdAt);
        return isWithinInterval(pDate, {
            start: new Date(startDate),
            end: new Date(endDate)
        });
    });

    const metrics = {
        totalPartes: filteredPartes.length,
        totalTime: filteredPartes.reduce((acc, p) => acc + p.totalTime, 0),
        closedPartes: filteredPartes.filter(p => p.status === 'CERRADO').length,
        avgTime: filteredPartes.length > 0 ? Math.round(filteredPartes.reduce((acc, p) => acc + p.totalTime, 0) / filteredPartes.length) : 0
    };

    // Chart Data Preparation
    const statusData = [
        { name: 'ABIERTO', value: filteredPartes.filter(p => p.status === 'ABIERTO').length, color: '#f59e0b' },
        { name: 'EN TRÁMITE', value: filteredPartes.filter(p => p.status === 'EN TRÁMITE').length, color: '#3b82f6' },
        { name: 'CERRADO', value: filteredPartes.filter(p => p.status === 'CERRADO').length, color: '#ef4444' },
    ];

    // Quick Activity Data
    const activityCounts: Record<string, number> = {};
    const actsByDate: Record<string, number> = {};

    filteredPartes.forEach(p => {
        p.actuaciones.forEach(a => {
            activityCounts[a.type] = (activityCounts[a.type] || 0) + 1;
            const dateKey = a.timestamp.split('T')[0];
            actsByDate[dateKey] = (actsByDate[dateKey] || 0) + 1;
        });
    });

    const activityData = Object.entries(activityCounts).map(([name, count]) => ({ name, count }));

    // Trend Data (Sort by date)
    const trendData = Object.entries(actsByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            // 1. Capture Charts
            let chartImages = undefined;
            if (chartsRef.current) {
                // Wait for render/animations
                await new Promise(resolve => setTimeout(resolve, 800));

                const statusEl = chartsRef.current.querySelector('#chart-status') as HTMLElement;
                const activityEl = chartsRef.current.querySelector('#chart-activity') as HTMLElement;
                const trendEl = chartsRef.current.querySelector('#chart-trend') as HTMLElement;

                if (statusEl && activityEl && trendEl) {
                    try {
                        const statusCanvas = await html2canvas(statusEl, { scale: 2 });
                        const activityCanvas = await html2canvas(activityEl, { scale: 2 });
                        const trendCanvas = await html2canvas(trendEl, { scale: 2 });

                        chartImages = {
                            status: statusCanvas.toDataURL('image/png'),
                            activity: activityCanvas.toDataURL('image/png'),
                            trend: trendCanvas.toDataURL('image/png')
                        };
                    } catch (err) {
                        console.warn('Error capturing charts:', err);
                    }
                }
            }

            // 2. Prepare Data
            const reportData = {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                metrics: metrics,
                partes: filteredPartes,
                chartImages
            };

            // 3. Generate
            await generatePdfReport(reportData);
            onClose();
        } catch (error) {
            console.error('Generación fallida:', error);
            alert(`Error al generar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-card w-[90%] max-h-[90vh] overflow-y-auto rounded-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 bg-white/80 dark:bg-slate-900/80">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/20 dark:border-white/10">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            Generar Informe PDF
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Selecciona el rango de fechas para el informe</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-8">
                    {/* Date Selection Section */}
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-blue-500" />
                                Seleccionar Periodo
                            </h3>
                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                {format(new Date(startDate), "d MMM yyyy", { locale: es })} - {format(new Date(endDate), "d MMM yyyy", { locale: es })}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 justify-center items-start w-full">
                            <div className="flex-1 w-full max-w-sm mx-auto">
                                <label className="block text-sm font-medium text-slate-500 mb-2 text-center">Fecha Inicio</label>
                                {/* @ts-ignore */}
                                <CalendarWithSelectors
                                    value={startDate}
                                    onChange={(date) => {
                                        setStartDate(date);
                                        if (new Date(date) > new Date(endDate)) {
                                            setEndDate(date);
                                        }
                                    }}
                                    max={endDate}
                                    className="w-full"
                                />
                            </div>

                            <div className="flex-1 w-full max-w-sm mx-auto">
                                <label className="block text-sm font-medium text-slate-500 mb-2 text-center">Fecha Fin</label>
                                {/* @ts-ignore */}
                                <CalendarWithSelectors
                                    value={endDate}
                                    onChange={(date) => {
                                        if (new Date(date) < new Date(startDate)) {
                                            setStartDate(date);
                                        }
                                        setEndDate(date);
                                    }}
                                    min={startDate}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-slate-700 dark:text-slate-300">Previsualización de Gráficos</h3>
                        <div
                            ref={chartsRef}
                            className="space-y-6"
                        >
                            {/* Row 1: Status & Activity */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div id="chart-status" className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <StatusDistributionChart data={statusData} />
                                </div>
                                <div id="chart-activity" className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <ActivityTypeChart data={activityData} />
                                </div>
                            </div>

                            {/* Row 2: Trend (New) */}
                            <div id="chart-trend" className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <TrendChart data={trendData} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Metrics Preview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MetricPreview label="Partes" value={metrics.totalPartes} />
                        <MetricPreview label="Minutos" value={metrics.totalTime} />
                        <MetricPreview label="Promedio" value={metrics.avgTime} />
                        <MetricPreview label="Cerrados" value={metrics.closedPartes} />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-white/40 dark:bg-slate-900/40 flex justify-end gap-3 sticky bottom-0 backdrop-blur-md">
                    <Button variant="outline" onClick={onClose} disabled={isGenerating} className="border-slate-200 dark:border-slate-700 dark:text-slate-300">
                        Cancelar
                    </Button>
                    <Button onClick={handleGenerate} disabled={isGenerating} className="min-w-[180px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-lg shadow-blue-500/30">
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generando...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Descargar PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const MetricPreview = ({ label, value }: { label: string, value: number }) => (
    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl text-center border border-blue-100 dark:border-blue-800">
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{value}</p>
    </div>
);
