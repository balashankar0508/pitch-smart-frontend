"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { Plus, LayoutTemplate, Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

export default function TemplatesPage() {
    const { user } = useAuth();
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
        if (!user?.email) return;
        setSyncing(true);
        try {
            const res = await fetch(`http://localhost:8080/api/templates/meta/sync?email=${user?.email}`, {
                method: 'POST'
            });
            if (res.ok) {
                const data = await res.json();
                setTemplates(Array.isArray(data) ? data : []);
            } else {
                console.error("Failed to sync templates");
            }
        } catch (err) {
            console.error("Error syncing meta templates:", err);
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        if (user?.email) {
            fetch(`http://localhost:8080/api/templates/meta?email=${user.email}`)
                .then((res) => res.json())
                .then((data) => {
                    setTemplates(Array.isArray(data) ? data : []);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Error fetching meta templates:", err);
                    setLoading(false);
                });
        }
    }, [user]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "APPROVED": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case "PENDING": return <Clock className="w-4 h-4 text-amber-500" />;
            case "REJECTED": return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-slate-400" />;
        }
    };

    if (loading) return <div className="p-8 text-slate-500">Loading templates...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Meta Templates</h1>
                    <p className="text-slate-500 mt-2">Manage your official WhatsApp predefined templates.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin text-indigo-500' : ''}`} />
                        {syncing ? 'Syncing...' : 'Refresh Status'}
                    </button>
                    <Link
                        href="/settings/templates/create"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Create Template
                    </Link>
                </div>
            </div>

            {templates.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                        <LayoutTemplate className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No templates yet</h3>
                    <p className="text-slate-500 mt-1 max-w-sm">Create an official Meta template to start business-initiated conversations with your leads.</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Template Name</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold">Language</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {templates.map((tpl) => (
                                <tr key={tpl.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{tpl.templateName}</td>
                                    <td className="px-6 py-4 text-slate-600">{tpl.category}</td>
                                    <td className="px-6 py-4 text-slate-600">{tpl.language}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 font-medium">
                                            {getStatusIcon(tpl.approvalStatus)}
                                            <span className={
                                                tpl.approvalStatus === 'APPROVED' ? 'text-emerald-700' :
                                                    tpl.approvalStatus === 'REJECTED' ? 'text-red-700' :
                                                        'text-amber-700'
                                            }>{tpl.approvalStatus}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
