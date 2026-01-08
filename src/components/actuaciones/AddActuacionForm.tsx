import { useState, useEffect } from 'react';
import type { ActuacionType } from '../../types';
import { ACTUACION_CONFIG } from '../../utils/actuacionConfig';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DatePicker } from '../ui/DatePicker';
import { clsx } from 'clsx';
import { X, Check } from 'lucide-react';

import { ALLOWED_USERS } from '../../utils/constants';

interface AddActuacionFormProps {
    onAdd: (actuacion: { type: ActuacionType; duration: number; notes: string; user: string; timestamp?: string }) => void;
    onCancel: () => void;
    initialData?: { type: ActuacionType; duration: number; notes: string; user: string; timestamp?: string };
}

export const AddActuacionForm = ({ onAdd, onCancel, initialData }: AddActuacionFormProps) => {
    const [type, setType] = useState<ActuacionType | null>(initialData?.type || null);
    const [duration, setDuration] = useState<string>(initialData?.duration.toString() || '');
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [user, setUser] = useState<string>(initialData?.user || ALLOWED_USERS[0]);
    const [customTimestamp, setCustomTimestamp] = useState(new Date().toISOString().slice(0, 16));

    // Sync state if initialData changes while component is mounted
    useEffect(() => {
        if (initialData) {
            setType(initialData.type);
            setDuration(initialData.duration.toString());
            setNotes(initialData.notes);
            setUser(initialData.user);
            if (initialData.timestamp) {
                setCustomTimestamp(new Date(initialData.timestamp).toISOString().slice(0, 16));
            }
        } else {
            // Reset if switching to add mode
            setType(null);
            setDuration('');
            setNotes('');
            setUser(ALLOWED_USERS[0]);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!type || !duration) return;

        onAdd({
            type,
            duration: parseInt(duration),
            notes,
            user,
            timestamp: new Date(customTimestamp).toISOString()
        });
    };

    return (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Registrar Nueva Actuación</h3>
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/50 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3 ml-1">Selecciona el tipo</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {(Object.keys(ACTUACION_CONFIG) as ActuacionType[]).map((t) => {
                            const config = ACTUACION_CONFIG[t];
                            const Icon = config.icon;
                            const isSelected = type === t;
                            return (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={clsx(
                                        'relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 text-xs font-medium gap-2 h-24 group',
                                        isSelected
                                            ? 'border-blue-500 bg-white shadow-md shadow-blue-500/10 text-blue-700 ring-1 ring-blue-500'
                                            : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md text-slate-600'
                                    )}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 text-blue-500">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    )}
                                    <Icon className={clsx("w-6 h-6 transition-transform group-hover:scale-110 duration-200", config.color)} />
                                    <span className="text-center leading-tight">{config.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                        type="number"
                        label="Duración (minutos)"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                        min="1"
                        placeholder="0"
                        className="bg-white dark:bg-slate-800"
                    />

                    <div className="flex gap-2">
                        <div className="flex-1">
                            <DatePicker
                                label="Fecha"
                                value={customTimestamp.split('T')[0]}
                                onChange={(date) => {
                                    const time = customTimestamp.split('T')[1] || '00:00';
                                    setCustomTimestamp(`${date}T${time}`);
                                }}
                                required
                                className="bg-white dark:bg-slate-800"
                            />
                        </div>
                        <div className="w-32">
                            <Input
                                type="time"
                                label="Hora"
                                value={customTimestamp.split('T')[1] || '00:00'}
                                onChange={(e) => {
                                    const date = customTimestamp.split('T')[0];
                                    setCustomTimestamp(`${date}T${e.target.value}`);
                                }}
                                required
                                className="bg-white dark:bg-slate-800"
                            />
                        </div>
                    </div>

                    <div className="w-full">
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Realizado por</label>
                        <div className="relative">
                            <select
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
                                className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                            >
                                {ALLOWED_USERS.map((u) => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 ml-1">Descripción de la Actuación</label>
                    <textarea
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Añade detalles adicionales sobre la actuación..."
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" disabled={!type || !duration} variant="primary">
                        {initialData ? 'Actualizar Actuación' : 'Guardar Actuación'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
