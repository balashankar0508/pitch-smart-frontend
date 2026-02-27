"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Phone, User, Clock, Check, CheckCheck, MessageSquare, Users, Paperclip, X, Image as ImageIcon, Video, Music, FileText, Search, ChevronDown } from "lucide-react"
import axios from "axios"
import { useAuth } from "@/components/AuthProvider"

interface Lead {
    id: number;
    customerId: number;
    phone: string;
    name: string;
    status: string;
    assignedUser?: {
        id: number;
        name: string;
    } | null;
    createdAt: string;
    updatedAt: string;
    requiresHumanAttention?: boolean;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Message {
    id: number;
    direction: string;
    messageText: string;
    sentAt: string;
    status?: string;
    mediaUrl?: string;
    type?: string;
    waMessageId?: string;
    rawMetadata?: string;
    replyContextId?: string;
}

export default function ChatDashboard() {
    const { user } = useAuth();
    const customerId = user?.customerId;
    const [leads, setLeads] = useState<Lead[]>([])
    const [activeLead, setActiveLead] = useState<Lead | null>(null)
    const [availableUsers, setAvailableUsers] = useState<User[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [showScrollButton, setShowScrollButton] = useState(false)
    const [replyingTo, setReplyingTo] = useState<Message | null>(null)
    const chatContainerRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const isFirstLoad = useRef(true)

    const cancelReply = () => setReplyingTo(null)

    const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null)
    const handleCopy = (msg: Message) => {
        navigator.clipboard.writeText(msg.messageText || "")
        setCopiedMessageId(msg.id)
        setTimeout(() => setCopiedMessageId(null), 2000)
    }

    // Fetch all leads for this tenant
    useEffect(() => {
        if (customerId) {
            fetchLeads()
            fetchAvailableUsers()
        } else {
            setLoading(false)
        }
    }, [customerId])

    // Poll for new messages when a lead is active
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (activeLead) {
            isFirstLoad.current = true
            fetchMessages(activeLead.id)
            interval = setInterval(() => {
                fetchMessages(activeLead.id)
            }, 5000) // Poll every 5s
        }
        return () => clearInterval(interval)
    }, [activeLead])

    const fetchAvailableUsers = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/users/customer/${customerId}`)
            setAvailableUsers(Array.isArray(res.data) ? res.data : [])
        } catch (e) {
            console.error("Failed to load users", e)
        }
    }

    const handleAssignLead = async (userId: string) => {
        if (!activeLead) return
        try {
            const res = await axios.patch(`http://localhost:8080/api/leads/${activeLead.id}/assign?userId=${userId}`)
            const updatedLead = res.data
            setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l))
            setActiveLead(updatedLead)
        } catch (e) {
            console.error("Failed to assign lead", e)
        }
    }

    const handleResolveChat = async () => {
        if (!activeLead) return
        try {
            const res = await axios.patch(`http://localhost:8080/api/leads/${activeLead.id}/resolve`)
            const updatedLead = res.data
            setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l))
            setActiveLead(updatedLead)
            alert("Chat resolved. Bot automation will resume on next message if applicable.")
        } catch (e) {
            console.error("Failed to resolve chat", e)
        }
    }

    const fetchLeads = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`http://localhost:8080/api/leads?customerId=${customerId}`)
            const data = Array.isArray(res.data) ? res.data : []

            // Sort so leads needing attention are top
            const sorted = data.sort((a, b) => {
                if (a.requiresHumanAttention && !b.requiresHumanAttention) return -1;
                if (!a.requiresHumanAttention && b.requiresHumanAttention) return 1;
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            })

            setLeads(sorted)
            if (sorted.length > 0 && !activeLead) {
                setActiveLead(sorted[0])
            }
        } catch (e) {
            console.error("Failed to load leads", e)
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async (leadId: number) => {
        try {
            const res = await axios.get(`http://localhost:8080/api/chat/${leadId}`)
            const messagesData = Array.isArray(res.data) ? res.data : []
            setMessages(messagesData)
        } catch (e) {
            console.error("Failed to load messages", e)
        }
    }

    const handleSendMessage = async (e?: React.FormEvent, mediaUrl?: string, mediaType?: string, textOverride?: string) => {
        if (e) e.preventDefault()
        const messageText = textOverride !== undefined ? textOverride : newMessage
        if (!messageText.trim() && !mediaUrl || !activeLead) return

        if (textOverride === undefined) {
            setNewMessage("")
        }
        setSending(true)

        // Optimistically add message
        const tempMsg: Message = {
            id: Date.now(),
            direction: "OUTBOUND",
            messageText: messageText,
            mediaUrl: mediaUrl,
            type: mediaType || 'text',
            sentAt: new Date().toISOString(),
            status: "SENDING",
            replyContextId: replyingTo?.waMessageId
        }
        setMessages(prev => [...prev, tempMsg])
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)

        try {
            await axios.post(`http://localhost:8080/api/chat/${activeLead.id}/send`, {
                message: messageText,
                mediaUrl: mediaUrl,
                type: mediaType || 'text',
                replyMessageId: replyingTo?.waMessageId
            })
            setReplyingTo(null)
            fetchMessages(activeLead.id) // Get real message from server
        } catch (e) {
            console.error("Failed to send message", e)
            alert("Failed to send message")
            fetchMessages(activeLead.id)
        } finally {
            setSending(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !activeLead) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await axios.post("http://localhost:8080/api/chat/file-upload", formData)
            const fileUrl = res.data.url

            // Determine type
            let type = "document"
            if (file.type.startsWith("image/")) type = "image"
            else if (file.type.startsWith("video/")) type = "video"
            else if (file.type.startsWith("audio/")) type = "audio"

            handleSendMessage(undefined, fileUrl, type)
        } catch (e) {
            console.error("Upload failed", e)
            alert("File upload failed")
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const filteredLeads = leads.filter(l =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.phone.includes(searchQuery)
    )

    const formatTime = (dateString: string) => {
        if (!dateString) return ""
        const d = new Date(dateString)
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const groupMessagesByDate = (msgs: Message[]) => {
        const groups: { [key: string]: Message[] } = {}
        msgs.forEach(msg => {
            const date = new Date(msg.sentAt)

            const today = new Date()
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)

            let dateStr = ""
            if (date.toDateString() === today.toDateString()) {
                dateStr = "Today"
            } else if (date.toDateString() === yesterday.toDateString()) {
                dateStr = "Yesterday"
            } else {
                dateStr = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
            }

            if (!groups[dateStr]) groups[dateStr] = []
            groups[dateStr].push(msg)
        })
        return groups
    }

    const handleScroll = () => {
        if (!chatContainerRef.current) return
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
        setShowScrollButton(!isAtBottom)
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
        setShowScrollButton(false)
    }

    useEffect(() => {
        if (!chatContainerRef.current) return
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 150

        // Auto-scroll if it's the first load for this lead OR if already near the bottom
        if (isFirstLoad.current || isAtBottom) {
            const behavior = isFirstLoad.current ? "auto" : "smooth"
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: behavior, block: "end" })
                isFirstLoad.current = false
            }, 50)
        }
    }, [messages])

    if (loading) return <div className="flex items-center justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>

    if (!customerId && !loading) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <Users className="h-16 w-16 text-slate-300" />
                <h2 className="text-xl font-semibold text-slate-500">No Tenant Selected</h2>
                <p className="text-slate-400">Please go to Super Admin and 'Login As' a tenant to view chats.</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-4 pt-4 overflow-hidden">
            {/* Sidebar: Leads List */}
            <Card className="w-72 flex flex-col overflow-hidden border-slate-200">
                <div className="p-4 border-b bg-slate-50/50">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                        Conversations
                    </h2>
                    <div className="relative mt-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search leads..."
                            className="bg-white pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    {filteredLeads.map((lead: Lead) => (
                        <div
                            key={lead.id}
                            onClick={() => setActiveLead(lead)}
                            className={`p-4 border-b cursor-pointer transition-colors flex items-start gap-3 hover:bg-slate-50 ${activeLead?.id === lead.id ? "bg-indigo-50/80 border-l-4 border-l-indigo-600" : "border-l-4 border-l-transparent"}`}
                        >
                            <Avatar className="h-10 w-10 border border-slate-200 relative">
                                <AvatarFallback className={activeLead?.id === lead.id ? "bg-indigo-100 text-indigo-700" : "bg-slate-100"}>
                                    {lead.name === "Unknown" ? <User className="w-5 h-5 text-slate-400" /> : lead.name.charAt(0)}
                                </AvatarFallback>
                                {lead.requiresHumanAttention && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                                    </span>
                                )}
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium text-slate-900 truncate">{lead.name === "Unknown" ? lead.phone : lead.name}</span>
                                    <span className="text-xs text-slate-400 font-medium">{formatTime(lead.updatedAt || lead.createdAt)}</span>
                                </div>
                                <div className="text-sm text-slate-500 truncate">{lead.phone}</div>
                            </div>
                        </div>
                    ))}
                    {filteredLeads.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            {searchQuery ? "No matches found" : "No active conversations found"}
                        </div>
                    )}
                </ScrollArea>
            </Card>

            {/* Main Chat Area */}
            {activeLead ? (
                <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-sm relative bg-[#efeae2]">
                    {/* WhatsApp style header */}
                    <div className="p-3 border-b bg-slate-50 flex justify-between items-center shadow-sm z-10 sticky top-0">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-slate-200">
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold shadow-inner">
                                    {activeLead.name === "Unknown" ? <User className="w-5 h-5" /> : activeLead.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-semibold text-slate-900 leading-tight">{activeLead.name === "Unknown" ? activeLead.phone : activeLead.name}</h3>
                                <div className="flex gap-2 items-center mt-0.5">
                                    <span className={`text-xs font-medium py-0.5 px-2 rounded-full inline-flex items-center gap-1 ${activeLead.requiresHumanAttention ? "bg-rose-100 text-rose-700" : "bg-green-50 text-green-600"}`}>
                                        {activeLead.requiresHumanAttention ? "Needs Human Agent" : activeLead.status === "RESOLVED" ? "Resolved" : "Bot Active"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {activeLead.requiresHumanAttention && (
                                <Button size="sm" variant="outline" onClick={handleResolveChat} className="text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100 mr-2">
                                    <Check className="w-4 h-4 mr-1" /> Resolve Chat
                                </Button>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-medium">Assigned To:</span>
                                <select
                                    className="text-xs bg-white border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={activeLead.assignedUser?.id || ""}
                                    onChange={(e) => handleAssignLead(e.target.value)}
                                >
                                    <option value="">Unassigned</option>
                                    {availableUsers.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-indigo-600"><Phone className="h-5 w-5" /></Button>
                        </div>
                    </div>

                    <div
                        ref={chatContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-4 bg-[#efeae2] relative scroll-smooth"
                        style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: 'contain' }}
                    >
                        <div className="max-w-5xl mx-auto flex flex-col gap-3 py-4">
                            {messages.length === 0 && (
                                <div className="bg-yellow-100/80 text-yellow-800 text-xs px-4 py-2 rounded-lg self-center mb-4 text-center shadow-sm w-3/4 max-w-sm">
                                    Messages and calls are end-to-end encrypted. No one outside of this chat, not even Meta, can read or listen to them.
                                </div>
                            )}
                            {Object.entries(groupMessagesByDate(messages)).map(([dateLabel, dateMessages]) => (
                                <div key={dateLabel} className="flex flex-col gap-1 w-full">
                                    <div className="flex justify-center z-10 my-2">
                                        <div className="bg-white/90 text-slate-500 text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-sm">
                                            {dateLabel}
                                        </div>
                                    </div>
                                    {dateMessages.map((msg: Message) => {
                                        const isOutbound = msg.direction === "OUTBOUND";

                                        // Extract Original Message Context for Interactive Replies
                                        let replyContextText = "";
                                        let replyContextSender = "Bot";
                                        let targetContextId: string | undefined;

                                        if (msg.replyContextId) {
                                            // Manual outbound replies linked by backend
                                            targetContextId = msg.replyContextId;
                                        } else if (msg.rawMetadata) {
                                            // Inbound webhook payload parsing
                                            try {
                                                const meta = JSON.parse(msg.rawMetadata);
                                                targetContextId = meta?.context?.message_id || meta?.context?.id;
                                            } catch (e) { }
                                        }

                                        if (targetContextId) {
                                            const originalMsg = messages.find(m => m.waMessageId === targetContextId);
                                            if (originalMsg) {
                                                replyContextText = (originalMsg.messageText || "").replace(/ \[(?:Buttons|List): [\s\S]*?\]/, "");
                                                // If original message was outbound, it was sent by us. Else, sent by them.
                                                replyContextSender = originalMsg.direction === "OUTBOUND" ? "You" : (activeLead?.name || "Customer");
                                            }
                                        }

                                        return (
                                            <div key={msg.id} id={`message-${msg.waMessageId}`} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-1 transition-colors duration-1000 rounded-lg`}>
                                                <div
                                                    className={`relative group max-w-[75%] rounded-lg px-3 py-2 text-[15px] shadow-sm ${isOutbound
                                                        ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none'
                                                        : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'
                                                        }`}
                                                    style={{ minWidth: '120px' }}
                                                >
                                                    {/* Tail for chat bubble effect */}
                                                    <div className={`absolute top-0 w-3 h-3 ${isOutbound ? '-right-2 bg-[#d9fdd3]' : '-left-2 bg-white'} `} style={{ clipPath: isOutbound ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(100% 0, 0 0, 100% 100%)' }}></div>

                                                    {/* Hover Action Menu */}
                                                    <div className={`absolute top-0 ${isOutbound ? 'left-0 -ml-[72px] flex-row-reverse' : 'right-0 -mr-[72px]'} opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1 py-1`}>
                                                        <button
                                                            onClick={() => setReplyingTo(msg)}
                                                            className="text-slate-400 hover:text-slate-600 bg-white/90 border border-slate-200 shadow-sm rounded-full p-1.5"
                                                            title="Reply"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                                                        </button>
                                                        {copiedMessageId === msg.id ? (
                                                            <div className="flex items-center gap-1 bg-white/90 border border-slate-200 shadow-sm rounded-full px-2 py-1">
                                                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                                <span className="text-[10px] text-emerald-600 font-bold pr-0.5">Copied!</span>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleCopy(msg)}
                                                                className="text-slate-400 hover:text-slate-600 bg-white/90 border border-slate-200 shadow-sm rounded-full p-1.5 transition-colors"
                                                                title="Copy"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* WhatsApp Style Reply Context Box */}
                                                    {replyContextText && (
                                                        <div
                                                            onClick={() => {
                                                                if (targetContextId) {
                                                                    const targetEl = document.getElementById(`message-${targetContextId}`);
                                                                    if (targetEl) {
                                                                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                                        targetEl.classList.add('bg-indigo-100/70', 'scale-[1.01]');
                                                                        setTimeout(() => {
                                                                            targetEl.classList.remove('bg-indigo-100/70', 'scale-[1.01]');
                                                                        }, 1500);
                                                                    }
                                                                }
                                                            }}
                                                            className="bg-black/5 border-l-4 border-[#00a884] rounded p-2 mb-2 text-[13px] text-slate-600 line-clamp-3 cursor-pointer hover:bg-black/10 transition-colors"
                                                        >
                                                            <span className="font-semibold text-[#00a884] block text-[11px] mb-0.5">{replyContextSender}</span>
                                                            <span className="whitespace-pre-line">{replyContextText}</span>
                                                        </div>
                                                    )}

                                                    <div className="whitespace-pre-wrap leading-snug pb-3">
                                                        {msg.type === 'image' && msg.mediaUrl && (
                                                            <div className="mb-2 rounded overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center min-h-[100px] min-w-[150px]">
                                                                <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer">
                                                                    <img src={msg.mediaUrl} alt="Image" className="max-w-[250px] max-h-[300px] object-cover" />
                                                                </a>
                                                            </div>
                                                        )}
                                                        {msg.type === 'video' && msg.mediaUrl && (
                                                            <div className="mb-2 rounded overflow-hidden border border-slate-200">
                                                                <video src={msg.mediaUrl} controls className="max-w-[250px] max-h-[300px]" />
                                                            </div>
                                                        )}
                                                        {msg.type === 'audio' && msg.mediaUrl && (
                                                            <div className="mb-2">
                                                                <audio src={msg.mediaUrl} controls className="max-w-[250px]" />
                                                            </div>
                                                        )}
                                                        {msg.type === 'document' && msg.mediaUrl && (
                                                            <div className="mb-2 p-2 bg-slate-50 border border-slate-200 rounded flex gap-2 items-center hover:bg-slate-100 transition-colors">
                                                                <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 flex items-center gap-1">
                                                                    📎 Download File
                                                                </a>
                                                            </div>
                                                        )}
                                                        {msg.messageText === '[Image Message]' ? (
                                                            <div className="flex items-center gap-1 text-slate-500 italic text-sm">
                                                                <ImageIcon className="w-4 h-4" /> Photo
                                                            </div>
                                                        ) : msg.messageText === '[Video Message]' ? (
                                                            <div className="flex items-center gap-1 text-slate-500 italic text-sm">
                                                                <Video className="w-4 h-4" /> Video
                                                            </div>
                                                        ) : msg.messageText === '[Audio Message]' ? (
                                                            <div className="flex items-center gap-1 text-slate-500 italic text-sm">
                                                                <Music className="w-4 h-4" /> Audio
                                                            </div>
                                                        ) : msg.messageText === '[Document Message]' ? (
                                                            <div className="flex items-center gap-1 text-slate-500 italic text-sm">
                                                                <FileText className="w-4 h-4" /> Document
                                                            </div>
                                                        ) : (
                                                            (() => {
                                                                const text = msg.messageText || "";

                                                                // Check for Buttons
                                                                const btnMatch = text.match(/([\s\S]*?) \[Buttons: ([\s\S]*?)\]/);
                                                                if (btnMatch) {
                                                                    const mainText = btnMatch[1];
                                                                    const buttons = btnMatch[2].split(',').map(b => b.trim());
                                                                    return (
                                                                        <div className="flex flex-col w-full">
                                                                            <span className="mb-2 block whitespace-pre-wrap">{mainText}</span>
                                                                            <div className="flex flex-col gap-1 border-t border-slate-200/50 pt-2 w-full mt-1">
                                                                                {buttons.map((btn, idx) => (
                                                                                    <div key={idx} className="text-center py-2 text-[#00a884] font-medium border-b border-slate-200/50 last:border-0 hover:bg-slate-50/50 cursor-pointer flex items-center justify-center gap-2">
                                                                                        <span className="text-xl leading-none -mt-1 h-3 flex items-start">↰</span> {btn}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }

                                                                // Check for List
                                                                const listMatch = text.match(/([\s\S]*?) \[List: ([\s\S]*?)\]/);
                                                                if (listMatch) {
                                                                    const mainText = listMatch[1];
                                                                    // We won't build a full interactive select modal since this is a history view for the agent,
                                                                    // but we can render it to look like the WhatsApp list button and expand inline or just show.
                                                                    const listItems = listMatch[2].split(',').map(b => b.trim());
                                                                    return (
                                                                        <div className="flex flex-col w-full">
                                                                            <span className="mb-2 block whitespace-pre-wrap">{mainText}</span>
                                                                            <div className="border-t border-slate-200/50 pt-2 w-full mt-1">
                                                                                <button
                                                                                    className="w-full text-center py-2 text-[#00a884] font-medium hover:bg-slate-50/50 flex items-center justify-center gap-2 rounded-b-md"
                                                                                    onClick={(e) => {
                                                                                        const target = e.currentTarget.nextElementSibling;
                                                                                        if (target) target.classList.toggle('hidden');
                                                                                    }}
                                                                                >
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                                                                                    View Options
                                                                                </button>
                                                                                <div className="hidden flex-col gap-1 mt-2 bg-slate-50/80 rounded-md p-2 border border-slate-100">
                                                                                    <div className="text-xs text-slate-500 mb-1 px-2 font-medium">List Items:</div>
                                                                                    {listItems.map((item, idx) => (
                                                                                        <div key={idx} className="flex items-center gap-2 px-2 py-1.5 text-slate-700">
                                                                                            <div className="w-3 h-3 rounded-full border border-slate-400"></div>
                                                                                            <span className="text-sm">{item}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }

                                                                return text;
                                                            })()
                                                        )}
                                                    </div>

                                                    <div className="absolute bottom-1 right-2 flex items-center gap-1 space-x-1">
                                                        <span className="text-[10px] text-slate-500 font-medium">{formatTime(msg.sentAt)}</span>
                                                        {isOutbound && (
                                                            msg.status === 'READ'
                                                                ? <CheckCheck className="w-[14px] h-[14px] text-blue-500" />
                                                                : msg.status === 'DELIVERED'
                                                                    ? <CheckCheck className="w-[14px] h-[14px] text-slate-400" />
                                                                    : msg.status === 'FAILED'
                                                                        ? (
                                                                            <button
                                                                                onClick={() => handleSendMessage(undefined, msg.mediaUrl, msg.type, msg.messageText)}
                                                                                className="flex items-center justify-center text-rose-500 hover:text-rose-700 hover:scale-110 transition-all ml-1"
                                                                                title="Message failed to send. Click to retry."
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                                                                            </button>
                                                                        )
                                                                        : <Check className="w-[14px] h-[14px] text-slate-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Scroll to Bottom Button */}
                        {showScrollButton && (
                            <button
                                onClick={scrollToBottom}
                                className="fixed bottom-24 right-12 bg-white/90 p-2 rounded-full shadow-md border border-slate-200 hover:bg-white transition-opacity z-50 text-slate-600"
                                title="Scroll to bottom"
                            >
                                <ChevronDown className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    <div className="p-3 bg-[#f0f2f5] border-t z-10 sticky bottom-0 flex flex-col gap-2">
                        {replyingTo && (
                            <div className="bg-slate-100 rounded-lg p-2 flex justify-between items-start border-l-4 border-[#00a884] shadow-sm ml-12 mr-14">
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[#00a884] font-semibold text-xs mb-1">
                                        {replyingTo.direction === 'OUTBOUND' ? 'You' : (activeLead?.name || 'Customer')}
                                    </span>
                                    <span className="text-slate-600 text-sm truncate">
                                        {replyingTo.messageText || (replyingTo.type === 'image' ? 'Photo' : replyingTo.type === 'document' ? 'Document' : replyingTo.type === 'video' ? 'Video' : 'Message')}
                                    </span>
                                </div>
                                <button
                                    onClick={cancelReply}
                                    className="text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <form onSubmit={(e) => handleSendMessage(e)} className="flex gap-2 max-w-4xl mx-auto relative group w-full">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                accept="image/*,video/*,audio/*,application/pdf"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading || sending}
                                className="rounded-full h-12 w-12 text-slate-600 hover:bg-slate-200 transition-colors shrink-0"
                            >
                                <Paperclip className={`h-5 w-5 ${uploading ? 'text-indigo-600' : ''}`} />
                            </Button>
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={uploading ? "Uploading..." : "Type a message..."}
                                disabled={sending || uploading}
                                className="flex-1 rounded-full px-5 py-6 bg-white border-0 shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-300 text-[15px]"
                            />
                            <Button
                                type="submit"
                                disabled={sending || uploading || (!newMessage.trim())}
                                size="icon"
                                className={`rounded-full w-12 h-12 flex-shrink-0 transition-all ${newMessage.trim() ? 'bg-[#00a884] hover:bg-[#008f6f] shadow-md' : 'bg-slate-300 pointer-events-none'}`}
                            >
                                <Send className="h-5 w-5 text-white ml-0.5" />
                            </Button>
                        </form>
                    </div>
                </Card>
            ) : (
                <Card className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 border-dashed border-2">
                    <MessageSquare className="w-16 h-16 mb-4 text-slate-300 opacity-50" />
                    <p className="text-xl font-medium text-slate-500">Select a conversion to start messaging</p>
                    <p className="text-sm mt-2">End-to-end encrypted messaging via Meta Cloud API</p>
                </Card>
            )}
        </div>
    )
}
