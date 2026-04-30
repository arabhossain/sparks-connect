import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiPlay, FiTrash2, FiEdit2, FiCode } from 'react-icons/fi';
import { useVault } from '../../components/VaultProvider';
import { invoke } from '@tauri-apps/api/core';

export default function SnippetsPanel({ onClose, activeSessionId }: { onClose: () => void, activeSessionId: string | null }) {
    const { items, addSnippet, updateSnippet, deleteItem } = useVault();
    const snippets = items.filter(i => i.type === 'snippet');
    
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', command: '', scope: 'global' });

    const handleSave = () => {
        if (!form.name || !form.command) return;
        if (editingId) {
            updateSnippet(editingId, form);
        } else {
            addSnippet({ ...form, id: crypto.randomUUID() });
        }
        setIsAdding(false);
        setEditingId(null);
        setForm({ name: '', command: '', scope: 'global' });
    };

    const handleRun = async (cmd: string) => {
        if (!activeSessionId) return;
        try {
            await invoke("ssh_write", { sessionId: activeSessionId, input: cmd + "\n" });
        } catch (e) {
            console.error("Failed to execute snippet", e);
        }
    };

    return (
        <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            style={{
                position: 'absolute', top: 0, right: 0, bottom: 0, width: '350px',
                background: 'rgba(20, 20, 20, 0.95)', backdropFilter: 'blur(10px)',
                borderLeft: '1px solid rgba(255,255,255,0.1)', zIndex: 200,
                display: 'flex', flexDirection: 'column'
            }}
        >
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><FiCode /> Snippets</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="icon-btn" onClick={() => { setIsAdding(true); setEditingId(null); setForm({ name: '', command: '', scope: 'global' }); }}><FiPlus size={16}/></button>
                    <button className="icon-btn" onClick={onClose}><FiX size={16}/></button>
                </div>
            </div>

            <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
                {isAdding && (
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                        <input className="search-input" style={{ width: '100%', marginBottom: '8px' }} placeholder="Snippet Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                        <textarea className="search-input" style={{ width: '100%', height: '80px', marginBottom: '8px', resize: 'none' }} placeholder="Command to run..." value={form.command} onChange={e => setForm({...form, command: e.target.value})} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button className="btn secondary-btn" onClick={() => setIsAdding(false)}>Cancel</button>
                            <button className="btn primary-btn" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                )}

                {!isAdding && snippets.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '20px' }}>No snippets found.</div>
                )}

                {snippets.map(s => {
                    const data = s.decrypted_data || {};
                    return (
                        <div key={s.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <strong>{data.name}</strong>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button className="icon-btn" onClick={() => handleRun(data.command)} disabled={!activeSessionId} title={activeSessionId ? "Run" : "Connect to a session to run"}><FiPlay size={14}/></button>
                                    <button className="icon-btn" onClick={() => { setForm({name: data.name, command: data.command, scope: data.scope}); setEditingId(s.id); setIsAdding(true); }}><FiEdit2 size={14}/></button>
                                    <button className="icon-btn danger" onClick={() => deleteItem(s.id)}><FiTrash2 size={14}/></button>
                                </div>
                            </div>
                            <pre style={{ margin: 0, fontSize: '12px', color: '#9ca3af', whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '4px' }}>
                                {data.command}
                            </pre>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
