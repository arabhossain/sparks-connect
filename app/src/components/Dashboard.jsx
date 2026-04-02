import React from "react";
import { motion } from "framer-motion";
import { FiPlus, FiTerminal, FiZap, FiShield, FiCpu } from "react-icons/fi";
import "../styles/dashboard.css";

export default function Dashboard({ onAdd, onConnect, hosts }) {
    const recentHosts = (hosts || []).slice(0, 3); // Just a placeholder for "Recent"

    return (
        <div className="dashboard-container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="dashboard-content"
            >
                <div className="dashboard-header-container" style={{marginBottom: '48px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    <div className="dashboard-header" style={{display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '0'}}>
                        <img src="/src/assets/logo.png" alt="Sparks Connect Logo" style={{width: '64px', height: '64px', borderRadius: '12px'}} />
                        <div style={{textAlign: 'left'}}>
                            <h1 style={{margin: '0', marginBottom: '4px'}}>Welcome to <span className="text-gradient">Sparks Connect</span></h1>
                            <p style={{margin: '0'}}>Your unified cloud management workstation. Connect to a server to get started.</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card glass-panel highlight" onClick={onAdd} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center'}}>
                        <div className="card-icon"><FiPlus /></div>
                        <h3>New Connection</h3>
                        <p>Configure a new SSH host to your workspace.</p>
                    </div>

                    <div className="dashboard-card glass-panel">
                        <div className="card-icon"><FiZap /></div>
                        <h3>Quick Connect</h3>
                        <p>Jump back into your most active sessions.</p>
                        <div className="recent-list">
                            {recentHosts.map(h => (
                                <div key={h.id} className="recent-item" onClick={(e) => { e.stopPropagation(); onConnect(h); }}>
                                    <FiTerminal size={12} />
                                    <span>{h.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                <div className="dashboard-status-bar" style={{justifyContent: 'center', marginTop: '32px'}}>
                    <div className="status-pill shield-pill">
                        <span className="pill-icon"><FiShield /></span>
                        <span>Keys Encrypted Locally</span>
                    </div>
                    <div className="status-pill cpu-pill">
                        <span className="pill-icon"><FiCpu /></span>
                        <span>Backend: <span className="online">Connected</span></span>
                    </div>
                    <div className="status-pill">
                        <span className="latency-text">12ms latency</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
