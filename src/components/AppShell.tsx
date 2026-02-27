"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";

const PUBLIC_PATHS = ["/login", "/register"];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { user, isLoggedIn } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const isPublicPage = PUBLIC_PATHS.includes(pathname);

    useEffect(() => {
        if (!isLoggedIn && !isPublicPage) {
            router.push("/login");
            return;
        }

        if (isLoggedIn && isPublicPage) {
            if (user?.role === "SUPER_ADMIN") {
                router.push("/admin");
            } else if (user?.isOnboarded) {
                router.push("/");
            } else {
                router.push("/onboarding");
            }
            return;
        }

        if (isLoggedIn && user?.role === "CUSTOMER" && !user?.isOnboarded && pathname !== "/onboarding") {
            router.push("/onboarding");
            return;
        }

        if (isLoggedIn && user?.role === "CUSTOMER" && pathname === "/admin") {
            router.push("/");
            return;
        }
    }, [isLoggedIn, isPublicPage, user, pathname, router]);

    // Show loading state or nothing while the effect handles redirection
    if (!isPublicPage && !isLoggedIn) return null;
    if (isLoggedIn && isPublicPage) return null;
    if (isLoggedIn && user?.role === "CUSTOMER" && !user?.isOnboarded && pathname !== "/onboarding") return null;
    if (isLoggedIn && user?.role === "CUSTOMER" && pathname === "/admin") return null;

    // Public pages (login, register) → no sidebar
    if (isPublicPage || pathname === "/onboarding") {
        return <>{children}</>;
    }

    // Normal authenticated layout
    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <Sidebar />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
