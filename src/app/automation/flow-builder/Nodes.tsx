import React, { useState } from 'react';
import { Handle, Position, useReactFlow, BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import { MessageSquare, MousePointerClick, GitBranch, Headphones, Zap, Plus, X, Trash2, List, MessageCircleQuestion, Pencil, ChevronDown } from 'lucide-react';

const nodeStyle = "bg-white border-2 rounded-xl shadow-sm min-w-[280px] hover:border-slate-300 transition-colors cursor-default pb-2";
const headerStyle = "px-4 py-2 border-b flex items-center gap-2 font-semibold text-sm rounded-t-lg";

export const NodeHeaderActions = ({ id, onCopy }: { id: string, onCopy?: () => void }) => {
    const { setNodes, setEdges } = useReactFlow();

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this node?")) {
            setNodes((nds) => nds.filter((n) => n.id !== id));
            setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
        }
    };

    return (
        <div className="ml-auto flex items-center gap-1">
            {onCopy && (
                <button onClick={onCopy} title="Duplicate Node" className="p-1 text-slate-400 hover:bg-slate-200 hover:text-blue-500 transition-colors rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
            )}
            <button onClick={handleDelete} title="Delete Node" className="p-1 text-slate-400 hover:bg-slate-200 hover:text-red-500 transition-colors rounded">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
};

export const TriggerNode = ({ id, data }: any) => {
    const { updateNodeData } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [localKeyword, setLocalKeyword] = useState(data.keyword || "");
    const { setNodes, getNode } = useReactFlow();

    const handleSave = () => {
        updateNodeData(id, { keyword: localKeyword });
        setIsEditing(false);
    };

    const handleCopy = () => {
        const node = getNode(id);
        if (node) {
            const newNode = {
                ...node,
                id: `${node.type}-${Date.now()}`,
                position: { x: node.position.x + 50, y: node.position.y + 50 },
                selected: false,
            };
            setNodes((nds) => nds.concat(newNode));
        }
    };

    return (
        <div className={`${nodeStyle} border-emerald-500`}>
            <div className={`${headerStyle} bg-emerald-50 text-emerald-700`}>
                <Zap className="w-4 h-4" /> Trigger
                <NodeHeaderActions id={id} onCopy={handleCopy} />
            </div>

            {!isEditing ? (
                <div
                    className="p-3 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setIsEditing(true)}
                >
                    <div className="font-semibold mb-1">Keyword</div>
                    <div className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md inline-block font-mono text-xs">
                        "{data.keyword || 'None'}"
                    </div>
                </div>
            ) : (
                <div className="p-4 text-sm text-slate-600">
                    <p className="mb-2 font-medium">When user reply contains:</p>
                    <input
                        type="text"
                        className="w-full font-mono bg-white border border-slate-200 p-2 rounded text-center font-bold focus:ring-2 focus:ring-emerald-500 outline-none nodrag mb-3"
                        value={localKeyword}
                        onChange={(e) => setLocalKeyword(e.target.value)}
                        placeholder="e.g. Know More"
                        autoFocus
                    />
                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                        <button onClick={() => { setLocalKeyword(data.keyword || ""); setIsEditing(false); }} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded shadow-sm">
                            Save
                        </button>
                    </div>
                </div>
            )}
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500" />
        </div>
    );
};

export const MessageNode = ({ id, data }: any) => {
    const { updateNodeData, setNodes, getNode, getNodes } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [localText, setLocalText] = useState(data.text || "");
    const [showVariables, setShowVariables] = useState(false);

    const handleSave = () => {
        updateNodeData(id, { text: localText });
        setIsEditing(false);
    };

    const handleCopy = () => {
        const node = getNode(id);
        if (node) {
            const newNode = {
                ...node,
                id: `${node.type}-${Date.now()}`,
                position: { x: node.position.x + 50, y: node.position.y + 50 },
                selected: false,
            };
            setNodes((nds) => nds.concat(newNode));
        }
    };

    const insertVariable = (varName: string) => {
        setLocalText((prev: string) => prev + `{{var.${varName}}}`);
        setShowVariables(false);
    };

    // Extract variables used in previous Ask nodes
    const availableVariables = React.useMemo(() => {
        const vars = new Set<string>();
        getNodes().forEach(n => {
            if (n.data && n.data.variable) {
                vars.add(n.data.variable as string);
            }
        });
        return Array.from(vars);
    }, [getNodes, showVariables]);

    return (
        <div className={`${nodeStyle} border-blue-400 relative`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-400" />
            <div className={`${headerStyle} bg-blue-50 text-blue-700`}>
                <MessageSquare className="w-4 h-4" /> Send Message
                <NodeHeaderActions id={id} onCopy={handleCopy} />
            </div>

            {!isEditing ? (
                <div
                    className="p-3 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setIsEditing(true)}
                >
                    <div className="font-semibold mb-1 text-xs text-slate-400 uppercase tracking-wide">Message</div>
                    <div className="text-slate-700 bg-slate-50 px-2 py-2 rounded-md border border-slate-100 line-clamp-2 italic">
                        {data.text ? `"${data.text}"` : "Click to edit message..."}
                    </div>
                </div>
            ) : (
                <div className="p-4 text-sm text-slate-600">
                    <div className="mb-2 flex justify-between items-center">
                        <span className="font-medium text-xs text-slate-500 uppercase">Text</span>
                        <div className="relative">
                            <button
                                onClick={() => setShowVariables(!showVariables)}
                                className="flex items-center gap-1 text-[10px] bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 px-2 py-1 rounded transition-colors"
                            >
                                Insert Variable <ChevronDown className="w-3 h-3" />
                            </button>
                            {showVariables && (
                                <div className="absolute right-0 top-full mt-1 w-40 bg-white border rounded shadow-lg z-20 overflow-hidden">
                                    <div className="px-2 py-1 bg-slate-50 text-[10px] font-semibold text-slate-500 border-b">Available Variables</div>
                                    <div className="max-h-32 overflow-y-auto">
                                        <button onClick={() => insertVariable('name')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 border-b font-mono">
                                            name (default)
                                        </button>
                                        <button onClick={() => insertVariable('contact')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 border-b font-mono">
                                            contact (global)
                                        </button>
                                        <button onClick={() => insertVariable('phoneShort')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 border-b last:border-0 font-mono">
                                            phoneShort (global)
                                        </button>
                                        {availableVariables.map((v, i) => (
                                            <button key={i} onClick={() => insertVariable(v)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 border-b last:border-0 font-mono">
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <textarea
                        className="w-full bg-slate-50 border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 nodrag mb-3"
                        value={localText}
                        onChange={(e) => setLocalText(e.target.value)}
                        placeholder="Enter message text... Use {{var.name}} for variables."
                        autoFocus
                    />
                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                        <button onClick={() => { setLocalText(data.text || ""); setIsEditing(false); }} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded shadow-sm">
                            Save
                        </button>
                    </div>
                </div>
            )}
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-400" />
        </div>
    );
};

export const ButtonsNode = ({ id, data }: any) => {
    const { updateNodeData, setNodes, getNode, getNodes } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);

    // Local state for edits
    const [localText, setLocalText] = useState(data.text || "");
    const [localButtons, setLocalButtons] = useState<string[]>(data.buttons || ["Option 1"]);
    const [localVariable, setLocalVariable] = useState(data.variable || "");
    const [showVariables, setShowVariables] = useState(false);

    // Extract variables used in previous Ask nodes
    const availableVariables = React.useMemo(() => {
        const vars = new Set<string>();
        getNodes().forEach(n => {
            if (n.data && n.data.variable) {
                vars.add(n.data.variable as string);
            }
        });
        return Array.from(vars);
    }, [getNodes, showVariables]);

    const insertVariable = (varName: string) => {
        setLocalText((prev: string) => prev + `{{var.${varName}}}`);
        setShowVariables(false);
    };

    const handleCopy = () => {
        const node = getNode(id);
        if (node) {
            const newNode = { ...node, id: `${node.type}-${Date.now()}`, position: { x: node.position.x + 50, y: node.position.y + 50 }, selected: false };
            setNodes((nds) => nds.concat(newNode));
        }
    };

    const handleSave = () => {
        updateNodeData(id, { text: localText, buttons: localButtons, variable: localVariable });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setLocalText(data.text || "");
        setLocalButtons(data.buttons || ["Option 1"]);
        setLocalVariable(data.variable || "");
        setIsEditing(false);
    };

    const updateButton = (index: number, val: string) => {
        const newBtns = [...localButtons];
        newBtns[index] = val;
        setLocalButtons(newBtns);
    };

    const addBtn = () => {
        if (localButtons.length < 3) {
            setLocalButtons([...localButtons, "New Option"]);
        }
    };

    const removeBtn = (index: number) => {
        setLocalButtons(localButtons.filter((_, i) => i !== index));
    };

    return (
        <div className={`${nodeStyle} border-indigo-400`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-400" />
            <div className={`${headerStyle} bg-indigo-50 text-indigo-700`}>
                <MousePointerClick className="w-4 h-4" /> Ask Buttons
                <NodeHeaderActions id={id} onCopy={handleCopy} />
            </div>

            {!isEditing ? (
                <div
                    className="p-3 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors relative"
                    onClick={() => setIsEditing(true)}
                >
                    <div className="font-semibold mb-1 text-xs text-slate-400 uppercase tracking-wide">Question</div>
                    <div className="text-slate-700 bg-slate-50 px-2 py-2 rounded-md border border-slate-100 line-clamp-2 italic mb-2">
                        {data.text ? `"${data.text}"` : "Click to edit..."}
                    </div>
                    {data.variable && (
                        <div className="text-[10px] text-indigo-600 font-mono bg-indigo-50 inline-block px-1.5 py-0.5 rounded border border-indigo-100 mb-2">
                            save ➔ {data.variable}
                        </div>
                    )}
                    <div className="flex gap-1 flex-wrap">
                        {(data.buttons || ["Option 1"]).map((btn: string, i: number) => (
                            <div key={i} className="text-[10px] bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded shadow-sm w-full text-center relative">
                                {btn}
                                <Handle type="source" position={Position.Right} id={`handle-${i}`} style={{ top: '50%', right: '-8px' }} className="w-2.5 h-2.5 bg-indigo-500" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="p-4 text-sm text-slate-600 space-y-3">
                    <div>
                        <div className="mb-2 flex justify-between items-center">
                            <span className="font-medium text-xs text-slate-500 uppercase">Question Text</span>
                            <div className="relative">
                                <button
                                    onClick={() => setShowVariables(!showVariables)}
                                    className="flex items-center gap-1 text-[10px] bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 px-2 py-1 rounded transition-colors"
                                >
                                    Insert Variable <ChevronDown className="w-3 h-3" />
                                </button>
                                {showVariables && (
                                    <div className="absolute right-0 top-full mt-1 w-40 bg-white border rounded shadow-lg z-20 overflow-hidden">
                                        <div className="px-2 py-1 bg-slate-50 text-[10px] font-semibold text-slate-500 border-b">Available Variables</div>
                                        <div className="max-h-32 overflow-y-auto">
                                            <button onClick={() => insertVariable('name')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 border-b font-mono">
                                                name (default)
                                            </button>
                                            <button onClick={() => insertVariable('contact')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 border-b font-mono">
                                                contact (global)
                                            </button>
                                            <button onClick={() => insertVariable('phoneShort')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 border-b font-mono">
                                                phoneShort (global)
                                            </button>
                                            {availableVariables.map((v, i) => (
                                                <button key={i} onClick={() => insertVariable(v)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 border-b last:border-0 font-mono">
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-20 nodrag"
                            value={localText}
                            onChange={(e) => setLocalText(e.target.value)}
                            placeholder="e.g. Which department?"
                            autoFocus
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="font-medium text-xs text-slate-500 uppercase">Button Options (Max 3)</span>
                        {localButtons.map((btn: string, i: number) => (
                            <div key={i} className="relative flex items-center gap-1 group">
                                <input
                                    className="flex-1 bg-white border border-slate-200 p-1.5 text-center rounded text-xs text-indigo-700 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none nodrag pr-6"
                                    value={btn}
                                    onChange={(e) => updateButton(i, e.target.value)}
                                />
                                {localButtons.length > 1 && (
                                    <button onClick={() => removeBtn(i)} className="absolute right-1 p-1 text-slate-400 hover:text-red-500 transition-colors bg-white">
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {localButtons.length < 3 && (
                            <button onClick={addBtn} className="w-full py-1.5 mt-1 border border-dashed border-slate-300 rounded text-xs text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors flex items-center justify-center gap-1">
                                <Plus className="w-3 h-3" /> Add Button
                            </button>
                        )}
                    </div>
                    <div className="pt-2">
                        <span className="font-medium text-xs text-slate-500 uppercase block mb-1">Save Response</span>
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-slate-500 nodrag placeholder:text-slate-400"
                            value={localVariable}
                            onChange={(e) => setLocalVariable(e.target.value)}
                            placeholder="Variable name (e.g. choice)"
                        />
                    </div>
                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 mt-2">
                        <button onClick={handleCancel} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
                        <button onClick={handleSave} className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded shadow-sm">Save</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const ListNode = ({ id, data }: any) => {
    const { updateNodeData, setNodes, getNode, getNodes } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);

    // Local state
    const [localText, setLocalText] = useState(data.text || "");
    const [localButtonText, setLocalButtonText] = useState(data.buttonText || "View Options");
    const [localItems, setLocalItems] = useState<string[]>(data.items || ["Item 1"]);
    const [localVariable, setLocalVariable] = useState(data.variable || "");
    const [showVariables, setShowVariables] = useState(false);

    // Extract variables used in previous Ask nodes
    const availableVariables = React.useMemo(() => {
        const vars = new Set<string>();
        getNodes().forEach(n => {
            if (n.data && n.data.variable) {
                vars.add(n.data.variable as string);
            }
        });
        return Array.from(vars);
    }, [getNodes, showVariables]);

    const insertVariable = (varName: string) => {
        setLocalText((prev: string) => prev + `{{var.${varName}}}`);
        setShowVariables(false);
    };

    const handleCopy = () => {
        const node = getNode(id);
        if (node) {
            const newNode = { ...node, id: `${node.type}-${Date.now()}`, position: { x: node.position.x + 50, y: node.position.y + 50 }, selected: false };
            setNodes((nds) => nds.concat(newNode));
        }
    };

    const handleSave = () => {
        updateNodeData(id, { text: localText, buttonText: localButtonText, items: localItems, variable: localVariable });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setLocalText(data.text || "");
        setLocalButtonText(data.buttonText || "View Options");
        setLocalItems(data.items || ["Item 1"]);
        setLocalVariable(data.variable || "");
        setIsEditing(false);
    };

    const updateItem = (index: number, val: string) => {
        const newItems = [...localItems];
        newItems[index] = val;
        setLocalItems(newItems);
    };

    const addItem = () => {
        if (localItems.length < 10) {
            setLocalItems([...localItems, "New Item"]);
        }
    };

    const removeItem = (index: number) => {
        setLocalItems(localItems.filter((_, i) => i !== index));
    };

    return (
        <div className={`${nodeStyle} border-purple-400`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-400" />
            <div className={`${headerStyle} bg-purple-50 text-purple-700`}>
                <List className="w-4 h-4" /> Ask List
                <NodeHeaderActions id={id} onCopy={handleCopy} />
            </div>

            {!isEditing ? (
                <div
                    className="p-3 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors relative"
                    onClick={() => setIsEditing(true)}
                >
                    <div className="font-semibold mb-1 text-xs text-slate-400 uppercase tracking-wide">Question</div>
                    <div className="text-slate-700 bg-slate-50 px-2 py-2 rounded-md border border-slate-100 line-clamp-2 italic mb-2">
                        {data.text ? `"${data.text}"` : "Click to edit..."}
                    </div>
                    {data.variable && (
                        <div className="text-[10px] text-purple-600 font-mono bg-purple-50 inline-block px-1.5 py-0.5 rounded border border-purple-100 mb-2">
                            save ➔ {data.variable}
                        </div>
                    )}
                    <div className="text-[10px] bg-white border border-purple-200 text-purple-700 font-semibold px-2 py-1 rounded shadow-sm w-full text-center mb-2">
                        {data.buttonText || "View Options"}
                    </div>
                    <div className="flex flex-col gap-1">
                        {(data.items || ["Item 1"]).map((item: string, i: number) => (
                            <div key={i} className="text-[10px] bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded w-full relative line-clamp-1">
                                • {item}
                                <Handle type="source" position={Position.Right} id={`handle-${i}`} style={{ top: '50%', right: '-8px' }} className="w-2.5 h-2.5 bg-purple-500" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="p-4 text-sm text-slate-600 space-y-3">
                    <div>
                        <div className="mb-2 flex justify-between items-center">
                            <span className="font-medium text-xs text-slate-500 uppercase block mb-1">Question Text</span>
                            <div className="relative">
                                <button
                                    onClick={() => setShowVariables(!showVariables)}
                                    className="flex items-center gap-1 text-[10px] bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 px-2 py-1 rounded transition-colors"
                                >
                                    Insert Variable <ChevronDown className="w-3 h-3" />
                                </button>
                                {showVariables && (
                                    <div className="absolute right-0 top-full mt-1 w-40 bg-white border rounded shadow-lg z-20 overflow-hidden">
                                        <div className="px-2 py-1 bg-slate-50 text-[10px] font-semibold text-slate-500 border-b">Available Variables</div>
                                        <div className="max-h-32 overflow-y-auto">
                                            <button onClick={() => insertVariable('name')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 border-b font-mono">
                                                name (default)
                                            </button>
                                            <button onClick={() => insertVariable('contact')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 border-b font-mono">
                                                contact (global)
                                            </button>
                                            <button onClick={() => insertVariable('phoneShort')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 border-b font-mono">
                                                phoneShort (global)
                                            </button>
                                            {availableVariables.map((v, i) => (
                                                <button key={i} onClick={() => insertVariable(v)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 border-b last:border-0 font-mono">
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none resize-none h-20 nodrag"
                            value={localText}
                            onChange={(e) => setLocalText(e.target.value)}
                            placeholder="Question text..."
                            autoFocus
                        />
                    </div>
                    <div>
                        <span className="font-medium text-xs text-slate-500 uppercase block mb-1">Menu Button Text</span>
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded text-xs focus:ring-2 focus:ring-purple-500 outline-none font-medium nodrag"
                            value={localButtonText}
                            onChange={(e) => setLocalButtonText(e.target.value)}
                            placeholder="e.g. View Options"
                        />
                    </div>
                    <div className="flex flex-col gap-2 border-t pt-2">
                        <span className="font-medium text-xs text-slate-500 uppercase">List Items (Max 10)</span>
                        {localItems.map((item: string, i: number) => (
                            <div key={i} className="relative flex items-center gap-1 group">
                                <input
                                    className="flex-1 bg-white border border-slate-200 p-1.5 rounded text-xs text-slate-700 focus:ring-2 focus:ring-purple-500 outline-none nodrag pr-6"
                                    value={item}
                                    onChange={(e) => updateItem(i, e.target.value)}
                                    placeholder={`Item ${i + 1}`}
                                />
                                {localItems.length > 1 && (
                                    <button onClick={() => removeItem(i)} className="absolute right-1 p-1 text-slate-400 hover:text-red-500 transition-colors bg-white">
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {localItems.length < 10 && (
                            <button onClick={addItem} className="w-full py-1.5 mt-1 border border-dashed border-slate-300 rounded text-xs text-slate-500 hover:text-purple-600 hover:border-purple-300 transition-colors flex items-center justify-center gap-1">
                                <Plus className="w-3 h-3" /> Add Item
                            </button>
                        )}
                    </div>
                    <div className="pt-2">
                        <span className="font-medium text-xs text-slate-500 uppercase block mb-1">Save Response</span>
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded text-xs focus:ring-2 focus:ring-purple-500 outline-none font-mono text-slate-500 nodrag placeholder:text-slate-400"
                            value={localVariable}
                            onChange={(e) => setLocalVariable(e.target.value)}
                            placeholder="Variable name (e.g. city)"
                        />
                    </div>
                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 mt-2">
                        <button onClick={handleCancel} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
                        <button onClick={handleSave} className="px-3 py-1.5 text-xs font-medium text-white bg-purple-500 hover:bg-purple-600 rounded shadow-sm">Save</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const AskTextNode = ({ id, data }: any) => {
    const { updateNodeData, setNodes, getNode, getNodes } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);

    const [localText, setLocalText] = useState(data.text || "");
    const [localVariable, setLocalVariable] = useState(data.variable || "");
    const [showVariables, setShowVariables] = useState(false);

    // Extract variables used in previous Ask nodes
    const availableVariables = React.useMemo(() => {
        const vars = new Set<string>();
        getNodes().forEach(n => {
            if (n.data && n.data.variable) {
                vars.add(n.data.variable as string);
            }
        });
        return Array.from(vars);
    }, [getNodes, showVariables]);

    const insertVariable = (varName: string) => {
        setLocalText((prev: string) => prev + `{{var.${varName}}}`);
        setShowVariables(false);
    };

    const handleCopy = () => {
        const node = getNode(id);
        if (node) {
            const newNode = { ...node, id: `${node.type}-${Date.now()}`, position: { x: node.position.x + 50, y: node.position.y + 50 }, selected: false };
            setNodes((nds) => nds.concat(newNode));
        }
    };

    const handleSave = () => {
        updateNodeData(id, { text: localText, variable: localVariable });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setLocalText(data.text || "");
        setLocalVariable(data.variable || "");
        setIsEditing(false);
    };

    return (
        <div className={`${nodeStyle} border-cyan-500 relative`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-cyan-500" />
            <div className={`${headerStyle} bg-cyan-50 text-cyan-700`}>
                <MessageCircleQuestion className="w-4 h-4" /> Ask Text
                <NodeHeaderActions id={id} onCopy={handleCopy} />
            </div>

            {!isEditing ? (
                <div
                    className="p-3 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setIsEditing(true)}
                >
                    <div className="font-semibold mb-1 text-xs text-slate-400 uppercase tracking-wide">Question</div>
                    <div className="text-slate-700 bg-slate-50 px-2 py-2 rounded-md border border-slate-100 line-clamp-2 italic mb-2">
                        {data.text ? `"${data.text}"` : "Click to edit question..."}
                    </div>
                    {data.variable && (
                        <div className="text-[10px] text-cyan-700 font-mono bg-cyan-50 inline-block px-1.5 py-0.5 rounded border border-cyan-200">
                            save ➔ {data.variable}
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-4 text-sm text-slate-600 space-y-3">
                    <div>
                        <div className="mb-2 flex justify-between items-center">
                            <span className="font-medium text-xs text-slate-500 uppercase block mb-1">Question</span>
                            <div className="relative">
                                <button
                                    onClick={() => setShowVariables(!showVariables)}
                                    className="flex items-center gap-1 text-[10px] bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 px-2 py-1 rounded transition-colors"
                                >
                                    Insert Variable <ChevronDown className="w-3 h-3" />
                                </button>
                                {showVariables && (
                                    <div className="absolute right-0 top-full mt-1 w-40 bg-white border rounded shadow-lg z-20 overflow-hidden">
                                        <div className="px-2 py-1 bg-slate-50 text-[10px] font-semibold text-slate-500 border-b">Available Variables</div>
                                        <div className="max-h-32 overflow-y-auto">
                                            <button onClick={() => insertVariable('name')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 border-b font-mono">
                                                name (default)
                                            </button>
                                            <button onClick={() => insertVariable('contact')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 border-b font-mono">
                                                contact (global)
                                            </button>
                                            <button onClick={() => insertVariable('phoneShort')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 border-b font-mono">
                                                phoneShort (global)
                                            </button>
                                            {availableVariables.map((v, i) => (
                                                <button key={i} onClick={() => insertVariable(v)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 border-b last:border-0 font-mono">
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded focus:ring-2 focus:ring-cyan-500 outline-none resize-none h-20 nodrag"
                            value={localText}
                            onChange={(e) => setLocalText(e.target.value)}
                            placeholder="Enter your question here..."
                            autoFocus
                        />
                    </div>
                    <div>
                        <span className="font-medium text-xs text-slate-500 uppercase block mb-1">Save Response</span>
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded text-xs focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-slate-500 nodrag placeholder:text-slate-400"
                            value={localVariable}
                            onChange={(e) => setLocalVariable(e.target.value)}
                            placeholder="Variable name (e.g. email)"
                        />
                    </div>
                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 mt-2">
                        <button onClick={handleCancel} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
                        <button onClick={handleSave} className="px-3 py-1.5 text-xs font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded shadow-sm">Save</button>
                    </div>
                </div>
            )}
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-cyan-500" />
        </div>
    );
};

export const ConditionNode = ({ id, data }: any) => {
    const { updateNodeData, setNodes, getNode } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);

    const [localField, setLocalField] = useState(data.field || "message");
    const [localOperator, setLocalOperator] = useState(data.operator || "contains");
    const [localValue, setLocalValue] = useState(data.value || "");

    const handleCopy = () => {
        const node = getNode(id);
        if (node) {
            const newNode = { ...node, id: `${node.type}-${Date.now()}`, position: { x: node.position.x + 50, y: node.position.y + 50 }, selected: false };
            setNodes((nds) => nds.concat(newNode));
        }
    };

    const handleSave = () => {
        updateNodeData(id, { field: localField, operator: localOperator, value: localValue });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setLocalField(data.field || "message");
        setLocalOperator(data.operator || "contains");
        setLocalValue(data.value || "");
        setIsEditing(false);
    };

    return (
        <div className={`${nodeStyle} border-amber-500 pb-0 relative`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-500" />
            <div className={`${headerStyle} bg-amber-50 text-amber-700`}>
                <GitBranch className="w-4 h-4" /> Condition
                <NodeHeaderActions id={id} onCopy={handleCopy} />
            </div>

            {!isEditing ? (
                <div
                    className="p-3 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors border-b"
                    onClick={() => setIsEditing(true)}
                >
                    <div className="font-semibold mb-1 text-xs text-slate-400 uppercase tracking-wide">Check</div>
                    <div className="text-slate-700 bg-amber-50/50 px-2 py-2 rounded-md border border-amber-100/50 text-xs font-mono">
                        {data.field || 'message'} <span className="text-amber-600 font-bold">{data.operator || 'contains'}</span> "{data.value || '...'}"
                    </div>
                </div>
            ) : (
                <div className="p-4 text-sm text-slate-600 space-y-3 pb-6 border-b">
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={localField}
                            onChange={(e) => setLocalField(e.target.value)}
                            className="p-1.5 border rounded bg-slate-50 text-xs nodrag outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="message">User Reply</option>
                        </select>
                        <select
                            value={localOperator}
                            onChange={(e) => setLocalOperator(e.target.value)}
                            className="p-1.5 border rounded bg-slate-50 text-xs nodrag outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="contains">Contains</option>
                            <option value="equals">Equals</option>
                        </select>
                    </div>
                    <input
                        type="text"
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        placeholder="Value (e.g. Yes)"
                        className="w-full p-1.5 border rounded bg-slate-50 text-xs nodrag outline-none focus:ring-2 focus:ring-amber-500"
                        autoFocus
                    />
                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 mt-2">
                        <button onClick={handleCancel} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
                        <button onClick={handleSave} className="px-3 py-1.5 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 rounded shadow-sm">Save</button>
                    </div>
                </div>
            )}
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
    const { setNodes, getNode } = useReactFlow();

    const handleCopy = () => {
        const node = getNode(id);
        if (node) {
            const newNode = { ...node, id: `${node.type}-${Date.now()}`, position: { x: node.position.x + 50, y: node.position.y + 50 }, selected: false };
            setNodes((nds) => nds.concat(newNode));
        }
    };

    return (
        <div className={`${nodeStyle} border-rose-500`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-rose-500" />
            <div className={`${headerStyle} bg-rose-50 text-rose-700`}>
                <Headphones className="w-4 h-4" /> Talk to Agent
                <NodeHeaderActions id={id} onCopy={handleCopy} />
            </div>
            <div className="p-4 text-sm text-slate-600 text-center bg-slate-50/50 m-2 rounded border border-slate-100 shadow-inner">
                <div className="font-semibold text-rose-700 mb-1">Human Handover</div>
                <p className="text-xs text-slate-500">Pauses automation and alerts team inbox.</p>
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
