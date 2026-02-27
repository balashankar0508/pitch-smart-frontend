"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/components/AuthProvider";
import { MessageSquare, ArrowRight, CheckCircle, Loader2 } from "lucide-react";

export default function OnboardingPage() {
    const { user, updateOnboarded, logout } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        wabaId: "",
        phoneNumberId: "",
        accessToken: "",
        phone: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleComplete = async () => {
        if (!user?.customerId) return;
        setError("");
        setLoading(true);
        try {
            await axios.patch(`http://localhost:8080/api/customers/${user.customerId}/onboard`, formData);
            updateOnboarded();
            router.push("/");
        } catch (e: any) {
            setError("Onboarding failed. Please check your details and try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        router.push("/login");
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
                        <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        LeadConvert
                    </span>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                            </div>
                            {s < 2 && <div className={`w-16 h-1 rounded ${step > 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                    {step === 1 && (
                        <>
                            <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome, {user.name}!</h2>
                            <p className="text-slate-500 mb-6">
                                Let's connect your WhatsApp Business Account to start automating lead conversations.
                                You'll need your Meta Developer Dashboard credentials.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">WhatsApp Business Account ID</label>
                                    <input type="text" name="wabaId" value={formData.wabaId} onChange={handleChange}
                                        placeholder="e.g. 200868466..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number ID</label>
                                    <input type="text" name="phoneNumberId" value={formData.phoneNumberId} onChange={handleChange}
                                        placeholder="e.g. 96415287..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
                                </div>
                            </div>
                            <button onClick={() => setStep(2)}
                                disabled={!formData.wabaId || !formData.phoneNumberId}
                                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md">
                                Next <ArrowRight className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h2 className="text-2xl font-bold text-slate-900 mb-1">Almost there!</h2>
                            <p className="text-slate-500 mb-6">Enter your API access token and the phone number connected to your WABA.</p>

                            {error && (
                                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm border border-red-100">{error}</div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">System Access Token</label>
                                    <input type="text" name="accessToken" value={formData.accessToken} onChange={handleChange}
                                        placeholder="EAAT6mnruZ..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">WhatsApp Phone Number</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setStep(1)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition-all">
                                    Back
                                </button>
                                <button onClick={handleComplete}
                                    disabled={loading || !formData.accessToken || !formData.phone}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                    Complete Setup
                                </button>
                            </div>
                        </>
                    )}
                </div>
                {/* Logout link for trapped users */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => { logout(); router.push("/login"); }}
                        className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
                    >
                        Sign out and try a different account
                    </button>
                </div>
            </div>
        </div>
    );
}
