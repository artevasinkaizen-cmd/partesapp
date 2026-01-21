import { useState, useEffect, useRef } from 'react';
import type { ActuacionType } from '../../types';
import { ACTUACION_CONFIG } from '../../utils/actuacionConfig';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DatePicker } from '../ui/DatePicker';
import { clsx } from 'clsx';
import { X, Check, Mic, MicOff, Save } from 'lucide-react';

import { ALLOWED_USERS } from '../../utils/constants';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface AddActuacionFormProps {
    onAdd: (actuacion: { type: ActuacionType; duration: number; notes: string; user: string; timestamp?: string }) => void;
    onCancel: () => void;
    initialData?: { type: ActuacionType; duration: number; notes: string; user: string; timestamp?: string };
}

const DRAFT_KEY = 'actuacion_draft_v1';

export const AddActuacionForm = ({ onAdd, onCancel, initialData }: AddActuacionFormProps) => {
    const [type, setType] = useState<ActuacionType | null>(initialData?.type || null);
    const [duration, setDuration] = useState<string>(initialData?.duration.toString() || '');
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [user, setUser] = useState<string>(initialData?.user || ALLOWED_USERS[0]);
    const [customTimestamp, setCustomTimestamp] = useState(new Date().toISOString().slice(0, 16));
    const [isDraftLoaded, setIsDraftLoaded] = useState(false);

    // Voice Dictation
    const { isListening, transcript, startListening, stopListening, resetTranscript, hasRecognitionSupport } = useSpeechRecognition();

    // Append transcript to notes when it changes
    useEffect(() => {
        if (transcript) {
            // Simple accumulation: add space if needed
            setNotes(prev => {
                const cleanTranscript = transcript.trim();
                if (!cleanTranscript) return prev;
                return prev + (prev.endsWith(' ') || prev.endsWith('</p>') ? '' : ' ') + cleanTranscript;
            });
            resetTranscript();
        }
    }, [transcript, resetTranscript]);


    // Auto-save Logic
    useEffect(() => {
        // Don't save if we are editing existing data (initialData present) or if it's completely empty
        if (initialData) return;

        const timeoutId = setTimeout(() => {
            if (type || duration || notes || user !== ALLOWED_USERS[0]) {
                const draft = { type, duration, notes, user, customTimestamp };
                localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            }
        }, 1000); // Debounce 1s

        return () => clearTimeout(timeoutId);
    }, [type, duration, notes, user, customTimestamp, initialData]);

    // Load Draft on Mount
    useEffect(() => {
        if (!initialData) {
            const savedDraft = localStorage.getItem(DRAFT_KEY);
            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);
                    setType(parsed.type || null);
                    setDuration(parsed.duration || '');
                    setNotes(parsed.notes || '');
                    setUser(parsed.user || ALLOWED_USERS[0]);
                    setCustomTimestamp(parsed.customTimestamp || new Date().toISOString().slice(0, 16));
                    setIsDraftLoaded(true);

                    // Clear the message after 3 seconds
                    setTimeout(() => setIsDraftLoaded(false), 3000);
                } catch (e) {
                    console.error("Failed to load draft", e);
                }
            }
        }
    }, [initialData]);

    // Clear draft on successful submit or cancel
    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
    };

    // Toolbar settings
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
        'list', 'bullet'
    ];

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
        clearDraft();
    };

    const handleCancel = () => {
        clearDraft();
        onCancel();
    }

    return (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-6 shadow-sm mb-6 relative overflow-hidden transition-all duration-300">
            {/* Draft Restore Indicator */}
            {isDraftLoaded && (
                <div className="absolute top-0 inset-x-0 bg-emerald-100 text-emerald-700 text-xs py-1 text-center font-medium animate-in slide-in-from-top duration-300">
                    <Save className="w-3 h-3 inline-block mr-1" />
                    Borrador recuperado automáticamente
                </div>
            )}

            <div className="flex justify-between items-center mb-6 mt-2">
                <h3 className="text-lg font-semibold text-slate-800">
                    {initialData ? 'Editar Actuación' : 'Registrar Nueva Actuación'}
                </h3>
                <button onClick={handleCancel} className="p-2 rounded-full hover:bg-white/50 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3 ml-1">Selecciona el tipo</label>
                    <div className="flex flex-wrap gap-3">
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
                                        'relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 text-xs font-medium gap-2 w-24 h-24 group',
                                        isSelected
                                            ? 'border-blue-500 bg-white shadow-md shadow-blue-500/10 text-blue-700 ring-1 ring-blue-500 z-10'
                                            : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md text-slate-600'
                                    )}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 text-blue-500">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    )}
                                    <Icon className={clsx("w-6 h-6 transition-transform group-hover:scale-110 duration-200", config.color)} />
                                    <span className="text-center leading-tight line-clamp-2">{config.label}</span>
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
                    <div className="flex justify-between items-end mb-1.5">
                        <label className="text-sm font-medium text-slate-700 ml-1">Descripción de la Actuación</label>

                        {hasRecognitionSupport && (
                            <button
                                type="button"
                                onClick={isListening ? stopListening : startListening}
                                className={clsx(
                                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300",
                                    isListening
                                        ? "bg-red-50 text-red-600 ring-1 ring-red-200 animate-pulse"
                                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                )}
                            >
                                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                                {isListening ? "Detener Dictado" : "Dictar voz"}
                            </button>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all quill-modern group relative">
                        <ReactQuill
                            theme="snow"
                            value={notes}
                            onChange={setNotes}
                            modules={modules}
                            formats={formats}
                            placeholder={isListening ? "Escuchando... habla ahora." : "Describe los detalles de la actuación..."}
                            className="rounded-xl overflow-hidden"
                        />
                        {isListening && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-ping pointer-events-none z-10" />
                        )}
                    </div>
                    {isListening && <p className="text-xs text-slate-500 px-1 animate-pulse">Grabando... (El texto aparecerá al terminar la frase)</p>}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={handleCancel}>Cancelar</Button>
                    <Button type="submit" disabled={!type || !duration} variant="primary">
                        {initialData ? 'Actualizar Actuación' : 'Guardar Actuación'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
