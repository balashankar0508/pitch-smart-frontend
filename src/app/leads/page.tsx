"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, MoreVertical, MessageCircle, Phone, CheckCircle2, Users } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/components/AuthProvider';

export default function LeadsPage() {
    const { user } = useAuth();
    const customerId = user?.customerId;
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (customerId) {
            fetchLeads();
        } else {
            setLoading(false);
        }
    }, [customerId]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:8080/api/leads?customerId=${customerId}`);
            setLeads(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error("Failed to fetch leads", e);
            setLeads([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkConverted = async (leadId: number) => {
        try {
            await axios.put(`http://localhost:8080/api/leads/${leadId}/status?status=CONVERTED`);
            fetchLeads(); // Refresh
        } catch (e) {
            console.error("Failed to convert lead", e);
            alert("Error converting lead.");
        }
    };

    if (!customerId && !loading) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <Users className="h-16 w-16 text-slate-300" />
                <h2 className="text-xl font-semibold text-slate-500">No Tenant Selected</h2>
                <p className="text-slate-400">Please go to Super Admin and 'Login As' a tenant to view leads.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Leads Management</h1>
                    <p className="text-slate-500 mt-1">Manage and convert your WhatsApp leads.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64 bg-white"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Leads Table */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Lead Info</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Source</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{lead.name}</div>
                                        <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                            <Phone className="w-3 h-3" /> {lead.phone}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full 
                                            ${lead.status === 'HOT' ? 'bg-orange-100 text-orange-700' :
                                                lead.status === 'ENGAGED' ? 'bg-indigo-100 text-indigo-700' :
                                                    lead.status === 'CONVERTED' ? 'bg-green-100 text-green-700' :
                                                        lead.status === 'COLD' ? 'bg-gray-100 text-gray-700' :
                                                            'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">API</td>
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="p-2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none">
                                                <MoreVertical className="w-5 h-5" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleMarkConverted(lead.id)} className="cursor-pointer text-green-600 font-medium">
                                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Converted
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Chat / Details Sidebar */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col h-[600px]">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
                            AS
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Alice Smith</h3>
                            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online now</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        <div className="flex flex-col gap-1 items-start">
                            <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none text-sm text-slate-700 max-w-[85%]">
                                Hi, I am interested in the assisted living options for my mother.
                            </div>
                            <span className="text-xs text-slate-400">10:42 AM</span>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                            <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none text-sm max-w-[85%]">
                                Hello Alice! We would love to help. Would you be available for a quick call today?
                            </div>
                            <span className="text-xs text-slate-400">10:45 AM</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <input type="text" placeholder="Type a message..." className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-full text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-full transition-colors flex-shrink-0">
                                <MessageCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
