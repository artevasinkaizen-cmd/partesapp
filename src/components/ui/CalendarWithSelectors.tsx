// @ts-nocheck
import { useState, useEffect } from 'react';
import { format, getMonth, getYear, setMonth, setYear } from 'date-fns';
import { es } from 'date-fns/locale';
import 'cally';

interface CalendarWithSelectorsProps {
    value: string;
    onChange: (date: string) => void;
    min?: string;
    max?: string;
    className?: string;
}

export const CalendarWithSelectors = ({ value, onChange, min, max, className }: CalendarWithSelectorsProps) => {
    // Initialize viewDate from value or today
    const [viewDate, setViewDate] = useState(() => value || new Date().toISOString().split('T')[0]);

    // Sync viewDate if value changes drastically (optional, but good UX if controlled externally)
    useEffect(() => {
        if (value) {
            setViewDate(value);
        }
    }, [value]);

    const currentDate = new Date(viewDate);
    const currentYear = getYear(currentDate);
    const currentMonth = getMonth(currentDate);

    // Range for Year Select (e.g., 2020 - 2030)
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
    const months = Array.from({ length: 12 }, (_, i) =>
        format(new Date(2000, i, 1), 'MMMM', { locale: es })
    );

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDate = setMonth(currentDate, parseInt(e.target.value));
        setViewDate(format(newDate, 'yyyy-MM-dd'));
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDate = setYear(currentDate, parseInt(e.target.value));
        setViewDate(format(newDate, 'yyyy-MM-dd'));
    };

    return (
        <div className={`flex flex-col items-center ${className}`}>

            {/* Custom Header with Selectors */}
            <div className="w-full flex justify-between items-center mb-4 px-2 gap-2">
                <select
                    value={currentMonth}
                    onChange={handleMonthChange}
                    className="bg-transparent font-display font-bold text-slate-700 dark:text-slate-200 text-lg capitalize cursor-pointer outline-none hover:text-blue-600 focus:text-blue-600 transition-colors"
                >
                    {months.map((m, i) => (
                        <option key={i} value={i} className="text-slate-900 bg-white">{m}</option>
                    ))}
                </select>

                <select
                    value={currentYear}
                    onChange={handleYearChange}
                    className="bg-transparent font-display font-bold text-slate-700 dark:text-slate-200 text-lg cursor-pointer outline-none hover:text-blue-600 focus:text-blue-600 transition-colors"
                >
                    {years.map((y) => (
                        <option key={y} value={y} className="text-slate-900 bg-white">{y}</option>
                    ))}
                </select>
            </div>

            {/* @ts-ignore */}
            <calendar-date
                value={value}
                min={min}
                max={max}
                focusedDate={viewDate}
                onChange={(e: any) => onChange(e.target.value)}
                locale="es-ES"
                className="text-slate-700 dark:text-slate-200 w-full"
            >
                {/* Hide default header buttons/text but keep structure if needed, or just rely on focusDate */}
                {/* We can provide slots to override or hide them, but using css to hide standard header if it duplicates is easier, 
                    OR we just don't put the header elements inside? 
                    cally `calendar-date` renders a header by default if we don't provide slot content? 
                    Actually, cally documentation examples show explicit <div slot="header"> or similar. 
                    If we provide children, often we provide the header manually.
                    Let's provide mostly empty navigation since we have selects? 
                    Or keep the arrows for prev/next month convenience! */}

                <div className="flex justify-between items-center mb-4 hidden"> {/* Hidden default header */}
                    <calendar-month></calendar-month>
                </div>

                {/*  We need to render calendar-month explicitly? cally usage usually requires <calendar-month /> child */}
                <calendar-month></calendar-month>

            </calendar-date>

            <style>{`
                calendar-date {
                    width: 100%;
                    max-width: 320px;
                    display: block;
                }
                calendar-month {
                    width: 100%;
                }
                calendar-month::part(button today) { color: #3b82f6; font-weight: bold; }
                calendar-month::part(button):hover { background-color: rgba(59, 130, 246, 0.1); }
                calendar-month::part(button selected) { background-color: #3b82f6; color: white; }
            `}</style>
        </div>
    );
};
