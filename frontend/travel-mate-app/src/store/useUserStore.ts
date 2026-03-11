// V's_new_start — Premium-Plus: Zustand with LocalStorage Persistence
// A page refresh will NO LONGER reset the user session ("Amnesia Fix")
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
    isAuthenticated: boolean;
    user: any | null;
    role: 'USER' | 'HOTEL_HOST' | 'ADMIN' | null;
    login: (userData: any, role: 'USER' | 'HOTEL_HOST' | 'ADMIN') => void;
    logout: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null,
            role: null,
            login: (userData, role) => set({ isAuthenticated: true, user: userData, role }),
            logout: () => {
                set({ isAuthenticated: false, user: null, role: null });
                window.location.href = '/';
            },
        }),
        {
            name: 'travelmate-user', // localStorage key
            storage: createJSONStorage(() => localStorage),
        }
    )
);
// V's_new_end
