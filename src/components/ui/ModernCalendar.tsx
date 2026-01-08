// @ts-nocheck
import { useEffect, useRef } from "react";
import "cally";

interface ModernCalendarProps {
    value: string;
    onChange: (date: string) => void;
    min?: string;
    max?: string;
    className?: string;
}

export const ModernCalendar = ({ value, onChange, min, max, className }: ModernCalendarProps) => {
    const ref = useRef<any>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleChange = (e: Event) => {
            onChange((e.target as any).value);
        };

        el.addEventListener("change", handleChange);
        return () => el.removeEventListener("change", handleChange);
    }, [onChange]);

    return (
        <div className={`p-4 rounded-xl glass-card border border-white/20 shadow-lg ${className}`}>
            {/* @ts-ignore */}
            <calendar-date
                ref={ref}
                value={value}
                min={min}
                max={max}
                locale="es-ES"
                className="text-slate-700 dark:text-slate-200"
            >
                <div className="flex justify-between items-center mb-4">
                    <button slot="previous" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <span slot="month" className="font-display font-semibold text-lg capitalize"></span>
                    <button slot="next" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                </div>

                <calendar-month></calendar-month>
            </calendar-date>

            <style>{`
        calendar-date {
          --color-accent: #3b82f6;
          --color-text-on-accent: #ffffff;
        }
        
        calendar-month {
          --color-text-default: inherit;
        }

        /* Custom Cally Styling for Glassmorphism */
        calendar-month::part(button) {
          border-radius: 9999px;
          transition: all 0.2s;
        }

        calendar-month::part(button):hover {
            background-color: rgba(59, 130, 246, 0.1);
        }

        calendar-month::part(button selected) {
            background-color: var(--color-accent);
            color: white;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        calendar-month::part(button today) {
            color: var(--color-accent);
            font-weight: bold;
        }
      `}</style>
        </div>
    );
};
