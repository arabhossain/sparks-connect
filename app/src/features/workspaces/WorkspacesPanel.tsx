import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiSave, FiPlay, FiTrash2, FiLayout } from 'react-icons/fi';
import { useVault } from '../../components/VaultProvider';

export default function WorkspacesPanel({ 
    onClose, 
    currentSessions, 
    currentLayout,
    onRestoreWorkspace 
}: { 
    onClose: () => void, 
    currentSessions: any[], 
    currentLayout: string,
    onRestoreWorkspace: (workspace: any) => void
}) {
    const { items, saveWorkspace, deleteItem } = useVault();
    const workspaces = items.filter(i => i.type === 'secret' && i.tag?.startsWith('workspace_'));
    
    const [isSaving, setIsSaving] = useState(false);
    const [wsName, setWsName] = useState('');
    const [confirmRestore, setConfirmRestore] = useState<any>(null);

    const handleInitiateRestore = (data: any) => {
        if (currentSessions.length > 0) {
            setConfirmRestore(data);
        } else {
            onRestoreWorkspace(data);
        }
    };

    const handleSave = () => {
        if (!wsName) return;
        saveWorkspace({
            name: wsName,
            layout: currentLayout,
            sessions: currentSessions.map(s => ({ hostId: s.host.id }))
        });
        setIsSaving(false);
        setWsName('');
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
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><FiLayout /> Workspaces</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="icon-btn" onClick={() => setIsSaving(true)} title="Save Current Workspace"><FiSave size={16}/></button>
                    <button className="icon-btn" onClick={onClose}><FiX size={16}/></button>
                </div>
            </div>

            <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
                {isSaving && (
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#9ca3af' }}>Saving {currentSessions.length} sessions with '{currentLayout}' layout.</p>
                        <input className="search-input" style={{ width: '100%', marginBottom: '8px' }} placeholder="Workspace Name" value={wsName} onChange={e => setWsName(e.target.value)} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button className="btn secondary-btn" onClick={() => setIsSaving(false)}>Cancel</button>
                            <button className="btn primary-btn" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                )}

                {!isSaving && workspaces.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '20px' }}>No saved workspaces.</div>
                )}

                {workspaces.map(w => {
                    const data = w.decrypted_data || {};
                    return (
                        <div key={w.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong style={{ display: 'block' }}>{data.name}</strong>
                                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{data.sessions?.length || 0} sessions • {data.layout}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button className="icon-btn" onClick={() => handleInitiateRestore(data)} title="Restore Workspace"><FiPlay size={14}/></button>
                                    <button className="icon-btn danger" onClick={() => deleteItem(w.id)}><FiTrash2 size={14}/></button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {confirmRestore && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '8px' }}>Restore Workspace</h4>
                        <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px', lineHeight: 1.4 }}>You have active sessions running. Do you want to close them or keep them open alongside the workspace?</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button className="btn primary-btn" onClick={() => { onRestoreWorkspace(confirmRestore, false); setConfirmRestore(null); }}>Close Existing</button>
                            <button className="btn secondary-btn" onClick={() => { onRestoreWorkspace(confirmRestore, true); setConfirmRestore(null); }}>Keep Existing</button>
                            <button className="btn" style={{ background: 'transparent' }} onClick={() => setConfirmRestore(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
