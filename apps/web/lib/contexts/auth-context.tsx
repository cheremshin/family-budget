'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import { User } from '../entities/user';

type AuthContextValue = {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type PropsT = {
    children: ReactNode;
};

export function AuthProvider({ children }: PropsT) {
    const [user, setUser] = useState<User | null>(null);

    const clearUser = () => setUser(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                clearUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }

    return context;
}
