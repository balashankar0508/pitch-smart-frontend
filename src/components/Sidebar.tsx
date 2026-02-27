"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, MessageSquare, Settings, Database, LogOut, UserPlus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/leads", label: "Leads", icon: Users },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/settings/users", label: "Team", icon: UserPlus },
    { href: "/settings/automation", label: "Automation", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const isSuperAdmin = user?.role === "SUPER_ADMIN";

    return (
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 px-4 py-6 flex flex-col shadow-sm hidden md:flex">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8 px-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    LeadConvert
                </span>
            </div>

            {/* User info */}
            {user && (
                <div className="mb-4 px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <span className={`inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isSuperAdmin ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {isSuperAdmin ? "Admin" : "Customer"}
                    </span>
                </div>
            )}

            {/* Nav Links */}
            <nav className="flex flex-col gap-1 flex-1">
                {navItems.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                            ${pathname === href
                                ? "bg-indigo-50 text-indigo-600 font-semibold"
                                : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                    >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{label}</span>
                    </Link>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto border-t border-slate-100 pt-4 space-y-2">
                {/* Super Admin link — only for SUPER_ADMIN role */}
                {isSuperAdmin && (
                    <Link
                        href="/admin"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                            ${pathname === "/admin"
                                ? "bg-red-100 text-red-700 font-semibold"
                                : "text-red-600 bg-red-50 hover:bg-red-100"
                            }`}
                    >
                        <Database className="w-5 h-5" />
                        <span className="font-medium">Super Admin</span>
                    </Link>
                )}

                {/* Logout */}
                <button
                    onClick={() => { logout(); window.location.href = "/login"; }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
