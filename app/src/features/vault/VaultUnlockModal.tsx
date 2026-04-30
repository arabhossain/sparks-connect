import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiX } from 'react-icons/fi';
import { useVault } from '../../components/VaultProvider';

export default function VaultUnlockModal({ onClose }: { onClose: () => void }) {
    const { unlockVault } = useVault();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUnlock = async () => {
        setLoading(true);
        const success = await unlockVault(password);
        setLoading(false);
        if (success) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="modal-content glass-panel"
                style={{ maxWidth: '400px' }}
            >
                <div className="modal-header">
                    <h3><FiLock style={{ marginRight: '8px' }} /> Unlock Vault</h3>
                    <button onClick={onClose} className="icon-btn"><FiX size={16} /></button>
                </div>
                <div className="modal-body" style={{ padding: '20px' }}>
                    <p style={{ marginBottom: '16px', color: '#9ca3af', fontSize: '14px' }}>
                        Enter your master password to unlock secure snippets and workspaces.
                    </p>
                    <div className="form-group">
                        <label>Master Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                            placeholder="Password..."
                            autoFocus
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn secondary-btn" onClick={onClose}>Cancel</button>
                    <button className="btn primary-btn" onClick={handleUnlock} disabled={loading}>
                        {loading ? 'Unlocking...' : 'Unlock'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
