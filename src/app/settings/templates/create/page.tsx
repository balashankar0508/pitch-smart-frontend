"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send, Smartphone } from "lucide-react";

export default function CreateTemplatePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        templateName: "",
        category: "Marketing",
        language: "English",
        headerType: "None",
        headerText: "",
        bodyText: "Hey {{1}}! 👋 Explore the {{2}} collection for a touch of brilliance. Get started now: Shop Here 🛍️",
        exampleVariableValues: ["Ravi", "Your Brand Name"] as string[],
        footerText: "",
        hasButtons: false,
        buttonType: "",
        buttons: [] as string[]
    });

    const handleSave = async (status: "DRAFT" | "PENDING") => {
        if (!form.templateName || !form.bodyText) {
            alert("Please fill in template name and body text.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                templateName: form.templateName.toLowerCase().replace(/\s+/g, '_'),
                category: form.category.toUpperCase(),
                language: form.language === "English" ? "en_US" : form.language,
                headerType: form.headerType.toUpperCase(),
                headerText: form.headerText,
                bodyText: form.bodyText,
                exampleVariableValues: form.exampleVariableValues,
                footerText: form.footerText,
                buttonsJson: form.hasButtons ? JSON.stringify({ type: form.buttonType, items: form.buttons }) : null,
                approvalStatus: status
            };

            const res = await fetch(`http://localhost:8080/api/templates/meta?email=${user?.email}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push("/settings/templates");
            } else {
                const errorData = await res.json().catch(() => null);
                alert(`Template creation failed: ${errorData?.approvalStatus || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while saving the template.");
        } finally {
            setSaving(false);
        }
    };

    const insertVariable = () => {
        const matches = form.bodyText.match(/\{\{(\d+)\}\}/g);
        const maxIndex = matches ? Math.max(...matches.map(m => parseInt(m.replace(/\D/g, '')))) : 0;
        const nextIndex = maxIndex + 1;
        setForm({
            ...form,
            bodyText: form.bodyText + ` {{${nextIndex}}}`,
            exampleVariableValues: [...form.exampleVariableValues, ""]
        });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-slate-900">CREATE TEMPLATE</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Template Name *</label>
                            <input
                                type="text"
                                value={form.templateName}
                                onChange={e => setForm({ ...form, templateName: e.target.value })}
                                placeholder="Enter template name"
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                            <select
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none"
                            >
                                <option>Marketing</option>
                                <option>Utility</option>
                                <option>Authentication</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Language *</label>
                            <select
                                value={form.language}
                                onChange={e => setForm({ ...form, language: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none"
                            >
                                <option>English</option>
                                <option>Spanish</option>
                            </select>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <label className="font-bold text-slate-900 flex items-center gap-2">Header <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded">(Optional)</span></label>
                        <div className="flex flex-wrap gap-4">
                            {['None', 'Text'].map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="header"
                                        checked={form.headerType === type}
                                        onChange={() => setForm({ ...form, headerType: type, headerText: type === 'None' ? '' : form.headerText })}
                                        className="text-emerald-500 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">{type}</span>
                                </label>
                            ))}
                        </div>
                        {form.headerType === 'Text' && (
                            <input type="text" placeholder="Enter header text" value={form.headerText} onChange={e => setForm({ ...form, headerText: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                        )}
                    </div>

                    {/* Body */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <label className="font-bold text-red-500">Message Body *</label>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500 font-medium">Variables:</span>
                            <button onClick={insertVariable} className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100">Add Variable {"{{#}}"}</button>
                        </div>

                        <textarea
                            value={form.bodyText}
                            onChange={e => setForm({ ...form, bodyText: e.target.value })}
                            className="w-full h-40 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                        />

                        {(() => {
                            const matches = form.bodyText.match(/\{\{(\d+)\}\}/g);
                            if (!matches) return null;
                            const indices = Array.from(new Set(matches.map(m => parseInt(m.replace(/\D/g, ''))))).sort((a, b) => a - b);
                            if (indices.length === 0) return null;

                            return (
                                <div className="mt-4 space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <p className="text-sm font-medium text-slate-700 mb-2">Set Example Values (Required by Meta)</p>
                                    {indices.map((idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-slate-500 w-10">{`{{${idx}}}`}</span>
                                            <input
                                                type="text"
                                                placeholder={`e.g. dummy value`}
                                                value={form.exampleVariableValues[idx - 1] || ''}
                                                onChange={e => {
                                                    const newValues = [...form.exampleVariableValues];
                                                    newValues[idx - 1] = e.target.value;
                                                    setForm({ ...form, exampleVariableValues: newValues });
                                                }}
                                                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Footer */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <label className="font-bold text-slate-900 flex items-center gap-2">Footer <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded">(Optional)</span></label>
                        <textarea
                            value={form.footerText}
                            onChange={e => setForm({ ...form, footerText: e.target.value })}
                            placeholder="You can use this space to add a tagline, a way to unsubscribe, etc.,"
                            className="w-full h-20 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                        />
                    </div>

                    <div className="flex gap-4 justify-end">
                        <button onClick={() => router.back()} className="px-6 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button onClick={() => handleSave("DRAFT")} disabled={saving} className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 shadow-sm shadow-emerald-100">Save as Draft</button>
                        <button onClick={() => handleSave("PENDING")} disabled={saving} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 shadow-sm shadow-teal-100">Submit for Approval</button>
                    </div>
                </div>

                {/* Live Preview Column */}
                <div className="hidden lg:block">
                    <div className="sticky top-8">
                        {/* Mock Phone Output simulating the screenshot */}
                        <div className="w-[320px] aspect-[9/19] bg-[url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')] bg-cover border-[10px] border-slate-900 rounded-[3rem] shadow-2xl overflow-hidden relative mx-auto">
                            {/* Header bar */}
                            <div className="bg-[#005c4b] h-16 w-full flex items-center px-4 gap-3">
                                <ArrowLeft className="w-5 h-5 text-white" />
                                <div className="w-8 h-8 rounded-full bg-slate-300"></div>
                                <div className="text-white font-semibold">BizMagnets</div>
                            </div>

                            {/* Message Bubble */}
                            <div className="p-4 flex flex-col items-start gap-1">
                                <div className="bg-white max-w-[90%] rounded-r-xl rounded-bl-xl p-2.5 shadow-sm text-sm text-slate-800 relative">
                                    {/* Arrow tail */}
                                    <div className="absolute top-0 -left-2 w-0 h-0 border-t-[0px] border-t-transparent border-r-[10px] border-r-white border-b-[12px] border-b-transparent"></div>

                                    {form.headerType === 'Text' && <div className="font-bold mb-1 text-[15px]">{form.headerText || "Header"}</div>}
                                    <div className="whitespace-pre-wrap">{form.bodyText}</div>
                                    {form.footerText && <div className="text-xs text-slate-400 mt-2">{form.footerText}</div>}
                                    <div className="text-[10px] text-slate-400 text-right mt-1">19:33</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
