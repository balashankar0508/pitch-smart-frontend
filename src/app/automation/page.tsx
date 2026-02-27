import { Play, Settings2, Clock, MessageSquare, Copy, CheckCircle2 } from 'lucide-react';

export default function AutomationPage() {
    const templates = [
        { id: 1, name: 'Welcome Message', trigger: 'New Lead', delay: 'Instant', status: 'Active' },
        { id: 2, name: 'Follow-up 1', trigger: 'No Reply', delay: '24 Hours', status: 'Active' },
        { id: 3, name: 'Booking Reminder', trigger: 'Meeting Scheduled', delay: 'Day Before', status: 'Inactive' },
    ];

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Automation Engine</h1>
                <p className="text-slate-500 mt-1">Configure your WhatsApp lead follow-up sequences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border text-center border-slate-200 p-6 rounded-2xl shadow-sm hover:border-indigo-300 transition-colors">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Play className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">Active Rules</h3>
                    <p className="text-3xl border-transparent font-black text-indigo-600">8</p>
                </div>
                <div className="bg-white border text-center border-slate-200 p-6 rounded-2xl shadow-sm hover:border-emerald-300 transition-colors">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">Messages Sent</h3>
                    <p className="text-3xl font-black text-emerald-600">14.2k</p>
                </div>
                <div className="bg-white border text-center border-slate-200 p-6 rounded-2xl shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-center">
                    <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 px-6 rounded-xl font-medium transition-all shadow-md hover:shadow-lg w-full">
                        <Settings2 className="w-5 h-5" />
                        Create New Rule
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 text-lg">Message Templates & Sequence</h3>
                </div>
                <div className="divide-y divide-slate-100 p-6 space-y-6">
                    {templates.map((tpl, i) => (
                        <div key={tpl.id} className="pt-6 first:pt-0 pb-2 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group">
                            <div className="flex gap-4 items-start flex-1 w-full relative">
                                {/* Connector line for sequence visual */}
                                {i !== templates.length - 1 && (
                                    <div className="absolute left-[19px] top-10 bottom-[-40px] w-0.5 bg-slate-100 hidden md:block z-0"></div>
                                )}

                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0 relative z-10 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                                    {i + 1}
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                        {tpl.name}
                                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded flex items-center gap-1 ${tpl.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {tpl.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                                            {tpl.status}
                                        </span>
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                                        <span className="flex items-center gap-1.5"><Play className="w-4 h-4 text-emerald-500" /> Trigger: {tpl.trigger}</span>
                                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" /> Delay: {tpl.delay}</span>
                                    </div>

                                    {/* Template preview box */}
                                    <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 italic flex items-start gap-3">
                                        <MessageSquare className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                        Hi {"{Name}"}, thanks for your interest... (Preview)
                                        <button className="ml-auto text-slate-400 hover:text-indigo-600"><Copy className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                                <button className="flex-1 md:flex-none px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700 transition-colors">Edit</button>
                                <div className="w-12 h-8 bg-indigo-600 rounded-full flex items-center p-1 cursor-pointer">
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${tpl.status === 'Active' ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
