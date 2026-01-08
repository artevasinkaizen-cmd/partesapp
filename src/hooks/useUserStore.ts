import { useAppStore } from '../store/useAppStore';
import { useMemo } from 'react';

/**
 * Hook tailored to return ONLY the data belonging to the current user.
 * This effectively simulates the "Local Database per User".
 */
export function useUserStore() {
    const store = useAppStore();
    const { currentUser, partes, clients } = store;

    // Filtered Data
    const userPartes = useMemo(() => {
        if (!currentUser) return [];
        // Legacy support: if userId is missing (old data), treat as "global" or handle migration.
        // For strict isolation: p.userId === currentUser.email
        return partes.filter(p => p.userId === currentUser.email);
    }, [partes, currentUser]);

    const userClients = useMemo(() => {
        if (!currentUser) return [];
        return clients.filter(c => c.userId === currentUser.email);
    }, [clients, currentUser]);

    return {
        ...store,
        partes: userPartes,
        clients: userClients,
        // Override add actions if needed validation was outside store, but store handles addition correctly now.
    };
}
