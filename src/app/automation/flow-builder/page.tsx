"use client";

import React, { useState, useCallback, useRef, useEffect, Suspense } from "react";
import {
    ReactFlow,
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    Connection,
    Edge,
    Node,
    useReactFlow
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAuth } from "@/components/AuthProvider";
import { TriggerNode, MessageNode, ButtonsNode, ConditionNode, AgentNode, ListNode, AskTextNode, ButtonEdge } from "./Nodes";
import { ArrowLeft, Save, Plus, Play, MessageCircleQuestion } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const nodeTypes = {
    trigger: TriggerNode,
    message: MessageNode,
    buttons: ButtonsNode,
    condition: ConditionNode,
    agent: AgentNode,
    list: ListNode,
    askText: AskTextNode
};

const edgeTypes = {
    button: ButtonEdge
};

const initialNodes: Node[] = [
    {
        id: "start",
        type: "trigger",
        position: { x: 250, y: 50 },
        data: { keyword: "Hello" },
    }
];

function FlowBuilderContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { getNodes, getEdges } = useReactFlow();

    const defaultFlowName = searchParams.get("name") || "Welcome Flow";
    const [flowName, setFlowName] = useState(defaultFlowName);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.email) return;

        const loadFlow = async () => {
            const nameToLoad = searchParams.get("name");
            if (nameToLoad) {
                try {
                    const res = await fetch(`http://localhost:8080/api/flows/${encodeURIComponent(nameToLoad)}?email=${user.email}`);
                    if (res.ok) {
                        const data = await res.json();
                        setFlowName(data.flowName);
                        if (data.nodesJson) setNodes(JSON.parse(data.nodesJson));
                        if (data.edgesJson) {
                            const loadedEdges = JSON.parse(data.edgesJson);
                            setEdges(loadedEdges.map((e: Edge) => ({ ...e, type: 'button' })));
                        }
                    }
                } catch (err) {
                    console.error("Failed to load flow", err);
                }
            }
            setLoading(false);
        };
        loadFlow();
    }, [user, searchParams, setNodes, setEdges]);

    // Auto-layout or drag drop references
    const yPos = useRef(200);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'button' }, eds)), [setEdges]);

    const addNode = (type: string, defaultData: any) => {
        const newNode: Node = {
            id: `${type}-${Date.now()}`,
            type,
            position: { x: 250, y: yPos.current },
            data: defaultData
        };
        yPos.current += 150;
        setNodes((nds) => nds.concat(newNode));
    };

    const saveFlow = async () => {
        if (!user?.email) return;
        setSaving(true);
        try {
            const currentNodes = getNodes();
            const currentEdges = getEdges();
            const triggerNode = currentNodes.find(n => n.type === 'trigger');
            const keyword = triggerNode?.data?.keyword || "Hello";

            const payload = {
                flowName,
                triggerKeyword: keyword,
                isActive: true,
                nodesJson: JSON.stringify(currentNodes),
                edgesJson: JSON.stringify(currentEdges)
            };

            const res = await fetch(`http://localhost:8080/api/flows?email=${user.email}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Flow saved and activated successfully!");
            } else {
                alert("Failed to save flow.");
            }
        } catch (err) {
            console.error(err);
            alert("Error saving flow.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-50 animate-in fade-in duration-500">
            {/* Header bar */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <input
                            type="text"
                            className="text-lg font-bold text-slate-900 bg-transparent outline-none focus:ring-2 focus:ring-emerald-500 rounded px-2 py-1"
                            value={flowName}
                            onChange={(e) => setFlowName(e.target.value)}
                        />
                        <div className="text-xs text-emerald-600 font-medium px-2 flex items-center gap-1">
                            <Play className="w-3 h-3 fill-emerald-600" /> Active
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={saveFlow} disabled={saving} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm">
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Flow"}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Tools */}
                <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-3 shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Add Nodes</h3>

                    <button onClick={() => addNode('message', { text: "Here is your information." })} className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-left transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <Plus className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <div className="font-semibold text-slate-900 text-sm">Send Message</div>
                            <div className="text-xs text-slate-500">Text or media</div>
                        </div>
                    </button>

                    <button onClick={() => addNode('buttons', { text: "What would you like to do?", buttons: ["Sales", "Support"] })} className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-left transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                            <Plus className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <div className="font-semibold text-slate-900 text-sm">Ask Buttons</div>
                            <div className="text-xs text-slate-500">Interactive quick replies</div>
                        </div>
                    </button>

                    <button onClick={() => addNode('askText', { text: "Please type your answer below:" })} className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-left transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                            <Plus className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <div className="font-semibold text-slate-900 text-sm">Ask Text</div>
                            <div className="text-xs text-slate-500">Wait for user input</div>
                        </div>
                    </button>

                    <button onClick={() => addNode('condition', {})} className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-left transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                            <Plus className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <div className="font-semibold text-slate-900 text-sm">Condition</div>
                            <div className="text-xs text-slate-500">Split by logic</div>
                        </div>
                    </button>

                    <button onClick={() => addNode('agent', {})} className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50 text-left transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                            <Plus className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <div className="font-semibold text-slate-900 text-sm">Talk to Agent</div>
                            <div className="text-xs text-slate-500">Hand off to human</div>
                        </div>
                    </button>

                    <button onClick={() => addNode('list', { text: "Select an item below", buttonText: "View Options", items: ["Item 1", "Item 2"] })} className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50 text-left transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                            <Plus className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <div className="font-semibold text-slate-900 text-sm">List Message</div>
                            <div className="text-xs text-slate-500">Up to 10 options list</div>
                        </div>
                    </button>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 h-full w-full relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        fitView
                        className="bg-slate-50"
                    >
                        <Background color="#cbd5e1" gap={16} />
                        <Controls className="bg-white border-slate-200 shadow-sm rounded-lg" />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
}

export default function FlowBuilderPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading editor...</div>}>
            <ReactFlowProvider>
                <FlowBuilderContent />
            </ReactFlowProvider>
        </Suspense>
    );
}
