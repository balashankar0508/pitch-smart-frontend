"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/components/AuthProvider";
import { MessageSquare, LogIn, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:8080/api/auth/login", { email, password });
            const userData = res.data;
            login(userData);

            if (userData.role === "SUPER_ADMIN") {
                router.push("/admin");
            } else if (userData.isOnboarded) {
                router.push("/");
            } else {
                router.push("/onboarding");
            }
        } catch (e: any) {
            setError(e.response?.data?.error || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px] opacity-60" />
            </div>

            <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden mx-4 lg:mx-0 min-h-[600px] border border-slate-100">

                {/* Branding Section (Left) */}
                <div className="w-full lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 lg:p-12 text-white flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">LeadConvert</span>
                        </div>

                        <h1 className="text-3xl lg:text-4xl font-extrabold mb-6 leading-tight">
                            Smart WhatsApp <br />
                            <span className="text-indigo-200">Follow-up Automation</span>
                        </h1>

                        <ul className="space-y-4 text-white/90">
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-indigo-300" />
                                <span>Real-time lead qualification</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-indigo-300" />
                                <span>Automated drip campaigns</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-indigo-300" />
                                <span>Multi-tenant scalability</span>
                            </li>
                        </ul>
                    </div>

                    <div className="hidden lg:block pt-8 border-t border-white/10">
                        <p className="text-sm text-white/60">
                            Trusted by 500+ businesses worldwide for lead conversion.
                        </p>
                    </div>
                </div>

                {/* Login Form Section (Right) */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12 bg-white flex flex-col justify-center">
                    <div className="max-w-sm mx-auto w-full">
                        <div className="mb-8">
                            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
                            <p className="text-slate-500">Please enter your details to sign in.</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm border border-red-100 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50 transition-all text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-slate-700">Password</label>
                                    <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot password?</a>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50 transition-all text-slate-900 placeholder:text-slate-400"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                                Sign In
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-slate-600 text-sm">
                                New here?{" "}
                                <Link href="/register" className="text-indigo-600 font-bold hover:underline transition-all">
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 text-slate-400 text-xs text-center w-full pointer-events-none">
                © {new Date().getFullYear()} LeadConvert. All rights reserved.
            </div>
        </div>
    );
}
