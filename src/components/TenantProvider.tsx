"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface TenantContextType {
    activeCustomerId: number | null;
    setActiveCustomerId: (id: number | null) => void;
    isAdmin: boolean;
    exitTenantView: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
    // Default to null, but try to load from localStorage if available
    const [activeCustomerId, setActiveCustomerId] = useState<number | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(true);

    // Initialize from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("activeCustomerId");
        if (saved) {
            setActiveCustomerId(Number(saved));
        }
    }, []);

    // Sync to localStorage on change
    useEffect(() => {
        if (activeCustomerId !== null) {
            localStorage.setItem("activeCustomerId", activeCustomerId.toString());
            setIsAdmin(false); // If a tenant is selected, we are no longer in Super Admin view
        } else {
            localStorage.removeItem("activeCustomerId");
            setIsAdmin(true);
        }
    }, [activeCustomerId]);

    const exitTenantView = () => {
        setActiveCustomerId(null);
    };

    return (
        <TenantContext.Provider value={{ activeCustomerId, setActiveCustomerId, isAdmin, exitTenantView }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error("useTenant must be used within a TenantProvider");
    }
    return context;
}
