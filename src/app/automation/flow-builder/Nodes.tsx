import React, { useState } from 'react';
import { Handle, Position, useReactFlow, BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import { MessageSquare, MousePointerClick, GitBranch, Headphones, Zap, Plus, X, Trash2, List } from 'lucide-react';

const nodeStyle = "bg-white border-2 rounded-xl shadow-sm min-w-[280px] hover:border-slate-300 transition-colors cursor-default pb-2";
const headerStyle = "px-4 py-2 border-b flex items-center gap-2 font-semibold text-sm rounded-t-lg";

export const DeleteButton = ({ id }: { id: string }) => {
    const { setNodes, setEdges } = useReactFlow();
    return (
        <button
            onClick={() => {
                setNodes((nds) => nds.filter((n) => n.id !== id));
                setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
            }}
            title="Delete Node"
            className="ml-auto p-1 text-slate-400 hover:bg-slate-200 hover:text-red-500 transition-colors rounded"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
};

export const TriggerNode = ({ id, data }: any) => {
    const { updateNodeData } = useReactFlow();
    return (
        <div className={`${nodeStyle} border-emerald-500`}>
            <div className={`${headerStyle} bg-emerald-50 text-emerald-700`}>
                <Zap className="w-4 h-4" /> Trigger: Keyword
            </div>
            <div className="p-4 text-sm text-slate-600">
                <p className="mb-2 font-medium">When user reply contains:</p>
                <input
                    type="text"
                    className="w-full font-mono bg-slate-50 border p-2 rounded text-center font-bold focus:ring-2 focus:ring-emerald-500 outline-none nodrag"
                    value={data.keyword || ""}
                    onChange={(e) => updateNodeData(id, { keyword: e.target.value })}
                    placeholder="e.g. Know More"
                />
            </div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500" />
        </div>
    );
};

export const MessageNode = ({ id, data }: any) => {
    const { updateNodeData } = useReactFlow();
    return (
        <div className={`${nodeStyle} border-blue-400`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-400" />
            <div className={`${headerStyle} bg-blue-50 text-blue-700`}>
                <MessageSquare className="w-4 h-4" /> Send Message
                <DeleteButton id={id} />
            </div>
            <div className="p-4 text-sm text-slate-600">
                <textarea
                    className="w-full bg-slate-50 border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 nodrag"
                    value={data.text || ""}
                    onChange={(e) => updateNodeData(id, { text: e.target.value })}
                    placeholder="Enter message text..."
                />
            </div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-400" />
        </div>
    );
};

export const ButtonsNode = ({ id, data }: any) => {
    const { updateNodeData } = useReactFlow();
    const buttons = data.buttons || ["Option 1"];

    const updateButton = (index: number, val: string) => {
        const newBtns = [...buttons];
        newBtns[index] = val;
        updateNodeData(id, { buttons: newBtns });
    };

    const addBtn = () => {
        if (buttons.length < 3) {
            updateNodeData(id, { buttons: [...buttons, "New Option"] });
        }
    };

    const removeBtn = (index: number) => {
        const newBtns = buttons.filter((_: any, i: number) => i !== index);
        updateNodeData(id, { buttons: newBtns });
    };

    return (
        <div className={`${nodeStyle} border-indigo-400`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-400" />
            <div className={`${headerStyle} bg-indigo-50 text-indigo-700`}>
                <MousePointerClick className="w-4 h-4" /> Ask Buttons
                <DeleteButton id={id} />
            </div>
            <div className="p-4 text-sm text-slate-600 space-y-3">
                <input
                    type="text"
                    className="w-full bg-slate-50 border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none font-medium nodrag"
                    value={data.text || ""}
                    onChange={(e) => updateNodeData(id, { text: e.target.value })}
                    placeholder="Question text..."
                />
                <div className="flex flex-col gap-2">
                    {buttons.map((btn: string, i: number) => (
                        <div key={i} className="relative flex items-center gap-1 group">
                            <input
                                className="flex-1 bg-white border p-1.5 text-center rounded text-xs text-indigo-700 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none nodrag pr-6"
                                value={btn}
                                onChange={(e) => updateButton(i, e.target.value)}
                            />
                            {buttons.length > 1 && (
                                <button onClick={() => removeBtn(i)} className="absolute right-1 p-1 text-slate-400 hover:text-red-500 transition-colors bg-white">
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`handle-${i}`}
                                style={{ top: '50%', right: '-8px' }}
                                className="w-3 h-3 bg-indigo-500"
                            />
                        </div>
                    ))}
                    {buttons.length < 3 && (
                        <button onClick={addBtn} className="w-full py-1.5 mt-1 border border-dashed border-slate-300 rounded text-xs text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors flex items-center justify-center gap-1">
                            <Plus className="w-3 h-3" /> Add Button
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ConditionNode = ({ id, data }: any) => {
    const { updateNodeData } = useReactFlow();

    return (
        <div className={`${nodeStyle} border-amber-500 pb-0`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-500" />
            <div className={`${headerStyle} bg-amber-50 text-amber-700`}>
                <GitBranch className="w-4 h-4" /> Condition
                <DeleteButton id={id} />
            </div>
            <div className="p-4 text-sm text-slate-600 space-y-3 pb-6 border-b">
                <div className="grid grid-cols-2 gap-2">
                    <select
                        value={data.field || "message"}
                        onChange={(e) => updateNodeData(id, { field: e.target.value })}
                        className="p-1.5 border rounded bg-slate-50 text-xs nodrag outline-none focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="message">User Reply</option>
                    </select>
                    <select
                        value={data.operator || "contains"}
                        onChange={(e) => updateNodeData(id, { operator: e.target.value })}
                        className="p-1.5 border rounded bg-slate-50 text-xs nodrag outline-none focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="contains">Contains</option>
                        <option value="equals">Equals</option>
                    </select>
                </div>
                <input
                    type="text"
                    value={data.value || ""}
                    onChange={(e) => updateNodeData(id, { value: e.target.value })}
                    placeholder="Value (e.g. Yes)"
                    className="w-full p-1.5 border rounded bg-slate-50 text-xs nodrag outline-none focus:ring-2 focus:ring-amber-500"
                />
            </div>
            <div className="relative h-8 flex items-center justify-between px-6 text-xs font-bold text-amber-600 bg-amber-50/50 rounded-b-lg">
                <span className="text-emerald-600">True</span>
                <span className="text-red-600">False</span>
                <Handle type="source" position={Position.Bottom} id="true" style={{ left: '20%' }} className="w-3 h-3 bg-emerald-500" />
                <Handle type="source" position={Position.Bottom} id="false" style={{ left: '80%' }} className="w-3 h-3 bg-red-500" />
            </div>
        </div>
    );
};

export const AgentNode = ({ id, data }: any) => {
    return (
        <div className={`${nodeStyle} border-rose-500`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-rose-500" />
            <div className={`${headerStyle} bg-rose-50 text-rose-700`}>
                <Headphones className="w-4 h-4" /> Talk to Agent
                <DeleteButton id={id} />
            </div>
            <div className="p-4 text-sm text-slate-600 text-center">
                <p>Status changed to <span className="font-bold text-rose-600">ENGAGED</span>.</p>
                <p className="text-xs text-slate-500 mt-1">Routed to Team Inbox.</p>
            </div>
        </div>
    );
};

export const ListNode = ({ id, data }: any) => {
    const { updateNodeData } = useReactFlow();
    const items = data.items || ["List Item 1"];

    const updateItem = (index: number, val: string) => {
        const newItems = [...items];
        newItems[index] = val;
        updateNodeData(id, { items: newItems });
    };

    const addItem = () => {
        if (items.length < 10) {
            updateNodeData(id, { items: [...items, "New Item"] });
        }
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_: any, i: number) => i !== index);
        updateNodeData(id, { items: newItems });
    };

    return (
        <div className={`${nodeStyle} border-purple-400`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-400" />
            <div className={`${headerStyle} bg-purple-50 text-purple-700`}>
                <List className="w-4 h-4" /> List Message
                <DeleteButton id={id} />
            </div>
            <div className="p-4 text-sm text-slate-600 space-y-3">
                <input
                    type="text"
                    className="w-full bg-slate-50 border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none font-medium nodrag mb-2"
                    value={data.text || ""}
                    onChange={(e) => updateNodeData(id, { text: e.target.value })}
                    placeholder="Message Body..."
                />
                <input
                    type="text"
                    className="w-full bg-slate-50 border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none font-medium nodrag text-xs"
                    value={data.buttonText || "View List"}
                    onChange={(e) => updateNodeData(id, { buttonText: e.target.value })}
                    placeholder="Button Text (e.g. View Options)"
                />
                <div className="flex flex-col gap-2">
                    {items.map((item: string, i: number) => (
                        <div key={i} className="relative flex items-center gap-1 group">
                            <input
                                className="flex-1 bg-white border p-1.5 text-xs text-purple-700 font-semibold focus:ring-2 focus:ring-purple-500 outline-none nodrag pr-6"
                                value={item}
                                onChange={(e) => updateItem(i, e.target.value)}
                                placeholder={`Item ${i + 1}`}
                            />
                            {items.length > 1 && (
                                <button onClick={() => removeItem(i)} className="absolute right-1 p-1 text-slate-400 hover:text-red-500 transition-colors bg-white">
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`handle-${i}`}
                                style={{ top: '50%', right: '-8px' }}
                                className="w-3 h-3 bg-purple-500"
                            />
                        </div>
                    ))}
                    {items.length < 10 && (
                        <button onClick={addItem} className="w-full py-1.5 mt-1 border border-dashed border-slate-300 rounded text-xs text-slate-500 hover:text-purple-600 hover:border-purple-300 transition-colors flex items-center justify-center gap-1">
                            <Plus className="w-3 h-3" /> Add Item
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ButtonEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }: EdgeProps) => {
    const { setEdges } = useReactFlow();
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const onEdgeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <foreignObject
                width={20}
                height={20}
                x={labelX - 10}
                y={labelY - 10}
                className="edgebutton-foreignobject"
                requiredExtensions="http://www.w3.org/1999/xhtml"
            >
                <div className="flex items-center justify-center w-full h-full">
                    <button
                        className="w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors text-slate-400"
                        onClick={onEdgeClick}
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </foreignObject>
        </>
    );
};
