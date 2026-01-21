import { useAppStore } from '../store/useAppStore';


/**
 * Hook tailored to return ONLY the data belonging to the current user.
 * This effectively simulates the "Local Database per User".
 */
export function useUserStore() {
    const store = useAppStore();
    const { partes, clients } = store;

    // Filtered Data
    // Filtered Data - UPDATED: All users see ALL data
    const userPartes = partes; // No filtering: return partes;
    const userClients = clients; // No filtering: return clients;

    // We can still compute ownership if needed for UI (e.g. highlight "My Partes")
    // but the requirement is "que todos los usuarios pudieran ver la información del resto"

    /* 
    const userPartes = useMemo(() => {
        if (!currentUser) return [];
        // Legacy support: if userId is missing (old data), treat as "global" or handle migration.
        // For strict isolation: p.userId === currentUser.id
        return partes.filter(p => p.userId === currentUser.id || p.userId === currentUser.email);
    }, [partes, currentUser]);

    const userClients = useMemo(() => {
        if (!currentUser) return [];
        return clients.filter(c => c.userId === currentUser.id || c.userId === currentUser.email);
    }, [clients, currentUser]);
    */

    return {
        ...store,
        partes: userPartes,
        clients: userClients,
        // Override add actions if needed validation was outside store, but store handles addition correctly now.
    };
}
