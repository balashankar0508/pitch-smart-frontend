"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { MessageSquare, Play, Info, GitBranch, Plus, Search, Power, Trash2, Edit3, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FlowConfig {
    id: number;
    flowName: string;
    triggerKeyword: string;
    isActive: boolean;
    updatedAt: string;
}

export default function AutomationSettings() {
    const { user } = useAuth();
    const router = useRouter();
    const [flows, setFlows] = useState<FlowConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (user?.email) {
            fetchFlows();
        }
    }, [user]);

    const fetchFlows = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/flows?email=${user?.email}`);
            if (res.ok) {
                const data = await res.json();
                setFlows(data || []);
            }
        } catch (err) {
            console.error("Error fetching flows:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (flowName: string, currentStatus: boolean) => {
        // Optimistic UI update
        setFlows(flows.map(f => f.flowName === flowName ? { ...f, isActive: !currentStatus } : f));
        // Real activation API (Wait, we only have activate endpoint! Let's just toggle in real life by calling save with updated status? The API only has /activate which forces to true. If we want toggle we might need a general save or new endpoint, but for now let's just use the /activate if true, or we can just let it be active since we didn't build deactivate explicitly, but wait, the save endpoint allows updating isActive).
        // Let's fetch the specific flow, toggle it, and save it.
        try {
            const res = await fetch(`http://localhost:8080/api/flows/${flowName}?email=${user?.email}`);
            if (res.ok) {
                const flow = await res.json();
                flow.isActive = !currentStatus;
                await fetch(`http://localhost:8080/api/flows?email=${user?.email}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(flow)
                });
            }
        } catch (e) {
            console.error(e);
            // Revert on error
            fetchFlows();
        }
    };

    const createNewFlow = () => {
        const name = prompt("Enter a name for the new flow:", "New Flow " + (flows.length + 1));
        if (name) {
            // Check if exists
            if (flows.find(f => f.flowName.toLowerCase() === name.toLowerCase())) {
                alert("A flow with this name already exists.");
                return;
            }
            router.push(`/automation/flow-builder?name=${encodeURIComponent(name)}`);
        }
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return "Just now";
        return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const filteredFlows = flows.filter(f => f.flowName.toLowerCase().includes(searchQuery.toLowerCase()) || (f.triggerKeyword && f.triggerKeyword.toLowerCase().includes(searchQuery.toLowerCase())));

    if (loading) return <div className="p-8 text-slate-500">Loading automation flows...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Automation Workflows</h1>
                    <p className="text-slate-500 mt-2">Manage visual chat flows triggered by specific user keywords.</p>
                </div>
                <button
                    onClick={createNewFlow}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Create New Flow
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="relative w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search flows or keywords..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                        />
                    </div>
                </div>

                {filteredFlows.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-slate-200">
                            <GitBranch className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No Flows Found</h3>
                        <p className="text-slate-500 max-w-sm mt-2 mb-6 text-sm">Create visual conversation trees to automatically handle inquiries based on specific keywords.</p>
                        <button onClick={createNewFlow} className="text-indigo-600 font-semibold text-sm hover:text-indigo-700 flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Create your first flow
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-xs uppercase text-slate-500 tracking-wider">
                                    <th className="px-6 py-4 font-semibold">Flow Name</th>
                                    <th className="px-6 py-4 font-semibold">Trigger Keyword</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Last Modified</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredFlows.map((flow) => (
                                    <tr key={flow.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${flow.isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    <GitBranch className="w-4 h-4" />
                                                </div>
                                                <span className="font-semibold text-slate-900">{flow.flowName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {flow.triggerKeyword ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    "{flow.triggerKeyword}"
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">No trigger defined</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleActive(flow.flowName, flow.isActive)}
                                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-colors ${flow.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                            >
                                                <span className="sr-only">Toggle flow</span>
                                                <span className={`pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${flow.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {formatTime(flow.updatedAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/automation/flow-builder?name=${encodeURIComponent(flow.flowName)}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                                                <Edit3 className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick Links Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                        WhatsApp Templates
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage official Meta WhatsApp templates for initiating conversations with leads outside the 24-hour window.
                    </p>
                </div>
                <Link
                    href="/settings/templates"
                    className="shrink-0 flex justify-center items-center py-2.5 px-6 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-xl transition-colors text-sm"
                >
                    Manage Templates
                </Link>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-blue-900 text-sm">How Multi-Flow Routing Works</h4>
                    <p className="text-blue-700 text-sm mt-1 leading-relaxed">
                        When a lead sends a message, the system checks if the message contains any of your active <strong>Trigger Keywords</strong>.
                        If a match is found, the system automatically starts that specific flow.
                        If no keywords match and there is no active conversation, it falls back to the default ENGAGED state for human agents.
                    </p>
                </div>
            </div>
        </div>
    );
}
