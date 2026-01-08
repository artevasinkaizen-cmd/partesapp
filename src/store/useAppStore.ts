import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import type { Parte, Actuacion, ParteStatus, Client, User } from '../types';

interface AppState {
    // UI State
    activeView: 'list' | 'kanban' | 'calendar';
    setActiveView: (view: 'list' | 'kanban' | 'calendar') => void;
    isLoading: boolean;
    error: string | null;

    // Auth State
    currentUser: User | null;
    checkSession: () => Promise<void>;
    loginUser: (email: string, pass: string) => Promise<boolean>;
    registerUser: (user: User) => Promise<boolean>;
    logoutUser: () => Promise<void>;

    // Data State
    partes: Parte[];
    clients: Client[];
    users: User[];

    // Data Actions
    fetchData: () => Promise<void>;

    addParte: (parte: Omit<Parte, 'id' | 'actuaciones' | 'totalTime' | 'totalActuaciones' | 'userId' | 'pdfFile' | 'pdfFileSigned'> & { id?: number; pdfFile?: string }) => Promise<void>;
    updateParteStatus: (id: number, status: ParteStatus) => Promise<void>;
    updateParte: (id: number, data: Partial<Parte>) => Promise<void>;
    deleteParte: (id: number) => Promise<void>;

    addActuacion: (parteId: number, actuacion: Omit<Actuacion, 'id' | 'parteId'>) => Promise<void>;
    updateActuacion: (parteId: number, actuacionId: string, data: Partial<Actuacion>) => Promise<void>;
    deleteActuacion: (parteId: number, actuacionId: string) => Promise<void>;

    addClient: (client: Omit<Client, 'id' | 'userId'>) => Promise<void>;
    updateClient: (id: string, data: Partial<Client>) => Promise<void>;

    getParte: (id: number) => Parte | undefined;
    updateUserProfile: (email: string, data: Partial<User>) => Promise<void>;
    changePassword: (email: string, oldPass: string, newPass: string) => Promise<boolean>;
}

export const useAppStore = create<AppState>((set, get) => ({
    activeView: 'list',
    setActiveView: (view) => set({ activeView: view }),
    isLoading: false,
    error: null,

    currentUser: null,
    partes: [],
    clients: [],
    users: [],

    checkSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            set({
                currentUser: {
                    email: session.user.email!,
                    name: session.user.user_metadata.full_name || '',
                    password: '', // Not needed/available
                    role: 'user'
                }
            });
            // Load data when session exists
            get().fetchData();
        } else {
            set({ currentUser: null, partes: [], clients: [] });
        }
    },

    loginUser: async (email, password) => {
        set({ isLoading: true, error: null });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            set({ isLoading: false, error: error.message });
            return false;
        }

        if (data.user) {
            set({
                currentUser: {
                    email: data.user.email!,
                    name: data.user.user_metadata.full_name || '',
                    password: '',
                    role: 'user'
                }
            });
            await get().fetchData();
        }
        set({ isLoading: false });
        return true;
    },

    registerUser: async (user) => {
        set({ isLoading: true, error: null });
        const { error } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
                data: { full_name: user.name }
            }
        });

        if (error) {
            set({ isLoading: false, error: error.message });
            return false;
        }
        set({ isLoading: false });
        return true;
    },

    logoutUser: async () => {
        await supabase.auth.signOut();
        set({ currentUser: null, partes: [], clients: [] });
    },

    fetchData: async () => {
        set({ isLoading: true });

        // 1. Fetch Partes and related Actuaciones
        // Note: Supabase returns flat rows usually. We need to nest them or fetch separate.
        // Let's fetch separate and map.

        const { data: partesData, error: partesError } = await supabase
            .from('partes')
            .select('*')
            .order('created_at', { ascending: false });

        if (partesError) {
            console.error('Error fetching partes:', partesError);
            set({ isLoading: false });
            return;
        }

        const { data: actData, error: actError } = await supabase
            .from('actuaciones')
            .select('*');

        if (actError) console.error('Error fetching actuaciones:', actError);

        // Map to internal types
        const mappedPartes: Parte[] = (partesData || []).map(p => {
            const pActs = (actData || []).filter(a => a.parte_id === p.id);
            return {
                id: p.id,
                title: p.description || 'Sin título', // Mapping description to title as per old schema? Or maybe add title col? Let's use description for now
                type: p.type as any,
                status: p.status as any,
                createdAt: p.created_at,
                createdBy: 'Sistema', // Placeholder until we join profiles
                userId: p.user_id || '', // Start with ID

                // Fields that were in 'Omit' but are needed in Parte
                pdfFile: undefined,
                pdfFileSigned: undefined,

                actuaciones: pActs.map(a => ({
                    id: a.id,
                    parteId: a.parte_id,
                    type: a.type as any,
                    timestamp: a.date,
                    duration: a.duration,
                    notes: a.description,
                    user: 'Sistema' // Placeholder
                })),
                totalTime: p.total_time,
                totalActuaciones: pActs.length
            };
        });

        set({ partes: mappedPartes, isLoading: false });
    },

    addParte: async (parteData) => {
        const { currentUser } = get();
        if (!currentUser) return;

        const { error } = await supabase
            .from('partes')
            .insert({
                type: 'INCIDENCIA', // Default or from input if we add it to UI
                description: parteData.title,
                status: parteData.status,
                start_date: parteData.createdAt,
                user_id: (await supabase.auth.getUser()).data.user?.id
            });

        if (error) {
            console.error('Error adding parte:', error);
            set({ error: error.message });
            return;
        }
        get().fetchData();
    },

    updateParteStatus: async (id, status) => {
        const { error } = await supabase
            .from('partes')
            .update({ status, closed_at: status === 'CERRADO' ? new Date().toISOString() : null })
            .eq('id', id);

        if (!error) get().fetchData();
    },

    updateParte: async (id, data) => {
        const updatePayload: any = {};
        if (data.title) updatePayload.description = data.title;
        if (data.status) updatePayload.status = data.status;
        if (data.pdfFile) updatePayload.pdf_file = data.pdfFile; // Assuming col exists or need to create

        if (Object.keys(updatePayload).length > 0) {
            await supabase.from('partes').update(updatePayload).eq('id', id);
            get().fetchData();
        }
    },

    deleteParte: async (id) => {
        await supabase.from('partes').delete().eq('id', id);
        get().fetchData();
    },

    addActuacion: async (parteId, actuacion) => {
        const { error } = await supabase
            .from('actuaciones')
            .insert({
                parte_id: parteId,
                type: actuacion.type,
                description: actuacion.notes,
                date: actuacion.timestamp || new Date().toISOString(),
                duration: actuacion.duration
            });

        if (!error) get().fetchData();
    },

    updateActuacion: async (_parteId, actuacionId, data) => {
        const payload: any = {};
        if (data.notes) payload.description = data.notes;
        if (data.duration) payload.duration = data.duration;
        if (data.type) payload.type = data.type;

        await supabase.from('actuaciones').update(payload).eq('id', actuacionId);
        get().fetchData();
    },

    deleteActuacion: async (_parteId, actuacionId) => {
        await supabase.from('actuaciones').delete().eq('id', actuacionId);
        get().fetchData();
    },

    addClient: async () => { console.warn('Add Client placeholder'); },
    updateClient: async () => { console.warn('Update Client placeholder'); },

    getParte: (id: number) => get().partes.find(p => p.id === id),

    updateUserProfile: async (_email, data) => {
        await supabase.auth.updateUser({ data: { full_name: data.name } });
        get().checkSession();
    },

    changePassword: async (_email, _oldPass, newPass) => {
        const { error } = await supabase.auth.updateUser({ password: newPass });
        return !error;
    },

}));
