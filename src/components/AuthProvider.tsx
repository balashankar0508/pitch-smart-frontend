"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;       // "SUPER_ADMIN" | "CUSTOMER"
    customerId: number | null;
    isOnboarded: boolean;
    businessName?: string;
}

interface AuthContextType {
    user: UserData | null;
    login: (userData: UserData) => void;
    logout: () => void;
    isLoggedIn: boolean;
    updateOnboarded: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [loaded, setLoaded] = useState(false);

    // Hydrate from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("auth_user");
        if (saved) {
            try {
                setUser(JSON.parse(saved));
            } catch { }
        }
        setLoaded(true);
    }, []);

    const login = (userData: UserData) => {
        setUser(userData);
        localStorage.setItem("auth_user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("auth_user");
        localStorage.removeItem("activeCustomerId");
    };

    const updateOnboarded = () => {
        if (user) {
            const updated = { ...user, isOnboarded: true };
            setUser(updated);
            localStorage.setItem("auth_user", JSON.stringify(updated));
        }
    };

    if (!loaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user, updateOnboarded }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
