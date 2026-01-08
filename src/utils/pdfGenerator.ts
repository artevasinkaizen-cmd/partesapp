import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type Parte, type ActuacionType } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import logoUrl from '../assets/logo.png';

interface ReportData {
    startDate: Date;
    endDate: Date;
    metrics: {
        totalPartes: number;
        totalTime: number;
        avgTime: number;
        closedPartes: number;
    };
    partes: Parte[];
    chartImages?: {
        status: string;
        activity: string;
        trend: string;
    };
}

const COLORS = {
    primary: [30, 41, 59], // Slate 800
    secondary: [71, 85, 105], // Slate 600
    accent: [59, 130, 246], // Blue 500
    white: [255, 255, 255],
    gray: [241, 245, 249], // Slate 100
};

const ACTUACION_TYPES: ActuacionType[] = [
    'Llamada Realizada',
    'Llamada Recibida',
    'Correo Enviado',
    'Correo Recibido',
    'Desplazamiento',
    'Formación',
    'Investigación',
    'Informe Corporativo',
    'Modificaciones',
    'Actualización',
    'Cargas/Proceso',
    'Incidencias',
    'Otros',
    'Traslado',
    'Tratamiento de Fichero'
];

export const generatePdfReport = async (data: ReportData) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;

    // Helper: Header
    const addHeader = (title: string, subtitle?: string) => {
        try {
            const imgProps = doc.getImageProperties(logoUrl);
            const ratio = imgProps.width / imgProps.height;
            const h = 15;
            const w = h * ratio;
            doc.addImage(logoUrl, 'PNG', 15, 10, w, h);
        } catch (e) {
            console.warn('Logo load error', e);
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.text(title || "INFORME CORPORATIVO", 195, 18, { align: 'right' });

        if (subtitle) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
            doc.text(subtitle, 195, 24, { align: 'right' });
        }

        doc.setDrawColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.setLineWidth(0.5);
        doc.line(15, 30, 195, 30);
    };

    // Helper: KPI Card
    const drawKpiCard = (label: string, value: string, x: number, y: number, w: number, h: number) => {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, y, w, h, 2, 2, 'FD');
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(label.toUpperCase(), x + (w / 2), y + 10, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.text(value, x + (w / 2), y + 22, { align: 'center' });
    };

    // --- 1. GLOBAL DASHBOARD ---
    const periodStr = `Periodo: ${format(data.startDate, 'dd MMM', { locale: es })} - ${format(data.endDate, 'dd MMM yyyy', { locale: es })}`;
    addHeader("DASHBOARD GLOBAL", periodStr);

    // Global KPIs
    const kpiY = 40;
    const cw = 40;
    drawKpiCard("TOTAL PARTES", data.metrics.totalPartes.toString(), 15, kpiY, cw, 30);
    drawKpiCard("TIEMPO TOTAL", `${(data.metrics.totalTime / 60).toFixed(1)}h`, 15 + cw + 5, kpiY, cw, 30);
    drawKpiCard("PROMEDIO", `${data.metrics.avgTime}m`, 15 + (cw + 5) * 2, kpiY, cw, 30);
    drawKpiCard("CERRADOS", data.metrics.closedPartes.toString(), 15 + (cw + 5) * 3, kpiY, cw, 30);

    // Global Charts - SPECTACULAR LAYOUT
    // 1. Trend Chart (Full Width at Top)
    if (data.chartImages) {
        doc.setFontSize(12);
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.setFont('helvetica', 'bold');
        doc.text("Evolución de Actividad", 15, 85);

        try {
            // Trend Chart
            if (data.chartImages.trend) {
                doc.addImage(data.chartImages.trend, 'PNG', 15, 90, 180, 60);
            }

            // Sub-charts
            const subChartY = 160;
            doc.text("Distribución y Tipología", 15, 155);

            doc.addImage(data.chartImages.status, 'PNG', 15, subChartY, 85, 60);
            doc.addImage(data.chartImages.activity, 'PNG', 110, subChartY, 85, 60);
        } catch (e) {
            console.warn(e);
        }
    }

    // --- 2. USER BREAKDOWN ---
    // Group partes by UserId (email)
    const partesByUser: Record<string, Parte[]> = {};
    data.partes.forEach(p => {
        const uid = p.userId || "Sin Asignar";
        if (!partesByUser[uid]) partesByUser[uid] = [];
        partesByUser[uid].push(p);
    });

    const users = Object.keys(partesByUser).sort();

    users.forEach(user => {
        doc.addPage();
        const userPartes = partesByUser[user];
        const userActs = userPartes.flatMap(p => p.actuaciones);

        // Calculate Metrics for this User
        const m = {
            total: userPartes.length,
            abiertos: userPartes.filter(p => p.status === 'ABIERTO').length,
            cerrados: userPartes.filter(p => p.status === 'CERRADO').length,
            tramite: userPartes.filter(p => p.status === 'EN TRÁMITE').length,
            trasladado: 0
        };

        addHeader("INFORME INDIVIDUAL", user);

        // --- SPECIFIC SUMMARY TABLE (As requested) ---
        const startY = 40;

        // Prepare Data for Table
        const tableData: any[] = [
            // Section 1: Partes
            [{ content: 'TOTAL PARTES', colSpan: 2, styles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: 'bold', halign: 'center' } }],
            ['RECIBIDOS', m.total],
            ['ABIERTO', m.abiertos],
            ['CERRADO', m.cerrados],
            ['EN TRAMITE / TRASLADO', m.tramite],

            // Section 2: Indicadores
            [{ content: 'TOTAL INDICADORES', colSpan: 2, styles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: 'bold', halign: 'center' } }],
            ['USUARIOS (Expedientes Únicos)', userPartes.length], // Proxy
        ];

        // Add Actuacion Types rows
        ACTUACION_TYPES.forEach(type => {
            const count = userActs.filter(a => a.type === type).length;
            tableData.push([type.toUpperCase(), count]);
        });

        autoTable(doc, {
            startY: startY,
            body: tableData,
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 3,
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 120 },
                1: { halign: 'center', cellWidth: 50 },
            },
            margin: { left: 20 }
        });

        // Visual Dashboard Per User (Standard Charts simulation)
        let finalY = (doc as any).lastAutoTable.finalY + 15;

        if (finalY < pageHeight - 80) {
            doc.setFontSize(11);
            doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
            doc.text("Distribución de Actividad (Top 5)", 20, finalY);

            // Count and Sort
            const typeCounts = ACTUACION_TYPES.map(t => ({ type: t, count: userActs.filter(a => a.type === t).length }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .filter(x => x.count > 0);

            let barY = finalY + 10;
            const maxVal = Math.max(...typeCounts.map(t => t.count), 1);
            const maxBarW = 100;

            typeCounts.forEach(item => {
                const barW = (item.count / maxVal) * maxBarW;

                doc.setFontSize(8);
                doc.text(item.type, 20, barY + 4);

                doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
                doc.rect(70, barY, barW, 5, 'F');
                doc.setTextColor(50);
                doc.text(item.count.toString(), 70 + barW + 2, barY + 4);
                barY += 8;
            });
        }
    });

    // Page Numbers
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${totalPages}`, 195, pageHeight - 10, { align: 'right' });
        doc.text(`Generado el ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 15, pageHeight - 10);
    }

    doc.save(`Informe_Corporativo_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
};
