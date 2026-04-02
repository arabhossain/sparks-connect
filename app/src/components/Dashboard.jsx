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
                <div className="dashboard-header">
                    <h1>Welcome to <span className="text-gradient">SparkConnect</span></h1>
                    <p>Your unified cloud management workstation. Connect to a server to get started.</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card glass-panel highlight" onClick={onAdd}>
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

                    <div className="dashboard-card glass-panel">
                        <div className="card-icon"><FiShield /></div>
                        <h3>Security Info</h3>
                        <p>All your SSH keys are encrypted and stored locally.</p>
                    </div>

                    <div className="dashboard-card glass-panel">
                        <div className="card-icon"><FiCpu /></div>
                        <h3>System Status</h3>
                        <p>Backend: <span className="status-badge online">Connected</span></p>
                        <p>Latency: <span className="latency-text">12ms</span></p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
