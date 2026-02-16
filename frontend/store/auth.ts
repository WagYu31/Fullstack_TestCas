import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    setAuth: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (user: User, token: string) => {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                set({
                    user,
                    token,
                    isAuthenticated: true,
                });
            },

            login: async (email: string, password: string) => {
                const response = await api.post('/auth/login', { email, password });
                const { access_token, user } = response.data;

                localStorage.setItem('token', access_token);
                localStorage.setItem('user', JSON.stringify(user));

                set({
                    user,
                    token: access_token,
                    isAuthenticated: true,
                });
            },

            register: async (name: string, email: string, password: string) => {
                await api.post('/auth/register', { email, password, name });
            },

            logout: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            },
        }),
        {
            name: 'auth-storage',
            skipHydration: true,
        }
    )
);
