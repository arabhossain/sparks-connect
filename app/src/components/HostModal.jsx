import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/modal.css";

export default function HostModal({ host, hosts = [], onClose, onSave }) {
    const [form, setForm] = useState({
        name: "",
        host: "",
        port: 22,
        user: "",
        authType: "password",

        password: "",
        sshKey: "",
        passphrase: "",

        useAgent: false,

        jumpHostId: "", // ✅ only reference existing host
    });

    useEffect(() => {
        if (host) {
            setForm(prev => ({
                ...prev,
                ...host,
            }));
        }
    }, [host]);

    const update = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="modal-overlay">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="modal-content glass-panel fade-in"
            >
                <h2>{host ? "Edit Server Connection" : "Add New Server"}</h2>

                <div className="form-group">
                    <label>Connection Name</label>
                    <input
                        placeholder="e.g. Production Web"
                        value={form.name}
                        onChange={e => update("name", e.target.value)}
                    />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <div className="form-group" style={{ flex: 3 }}>
                        <label>Hostname / IP</label>
                        <input
                            placeholder="e.g. 192.168.1.1"
                            value={form.host}
                            onChange={e => update("host", e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Port</label>
                        <input
                            type="number"
                            placeholder="22"
                            value={form.port}
                            onChange={e => update("port", e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Username</label>
                    <input
                        placeholder="root"
                        value={form.user}
                        onChange={e => update("user", e.target.value)}
                    />
                </div>

                {/* ================= AUTH ================= */}
                <div className="auth-section">
                    <h4>Authentication</h4>

                    <div className="form-group">
                        <label>Auth Method</label>
                        <select
                            value={form.authType}
                            onChange={e => update("authType", e.target.value)}
                        >
                            <option value="password">Password</option>
                            <option value="sshKey">SSH Key</option>
                            <option value="agent">SSH Agent</option>
                        </select>
                    </div>

                    {form.authType === "password" && (
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => update("password", e.target.value)}
                            />
                        </div>
                    )}

                    {form.authType === "sshKey" && (
                        <>
                            <div className="form-group">
                                <label>Private Key Content</label>
                                <textarea
                                    style={{ height: "100px" }}
                                    placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                                    value={form.sshKey}
                                    onChange={e => update("sshKey", e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Passphrase (Optional)</label>
                                <input
                                    type="password"
                                    placeholder="Optional"
                                    value={form.passphrase}
                                    onChange={e => update("passphrase", e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {form.authType === "agent" && (
                        <label style={{ display: "flex", gap: "12px", alignItems: "center", cursor: "pointer", fontSize: "14px" }}>
                            <input
                                type="checkbox"
                                style={{ width: "18px", height: "18px" }}
                                checked={form.useAgent}
                                onChange={e => update("useAgent", e.target.checked)}
                            />
                            Use SSH Agent From System
                        </label>
                    )}
                </div>

                {/* ================= JUMP HOST ================= */}
                <div className="jump-section">
                    <h4>Jump Host / Proxy</h4>

                    <div className="form-group">
                        <label>Jump Host Selection</label>
                        <select
                            value={form.jumpHostId || ""}
                            onChange={e => update("jumpHostId", e.target.value)}
                        >
                            <option value="">No Proxy (Direct)</option>
                            {hosts.map(h => (
                                <option key={h.id} value={h.id}>
                                    {h.name} ({h.host})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ================= ACTIONS ================= */}
                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-cancel">
                        Cancel
                    </button>
                    <button onClick={() => onSave(form)} className="btn btn-save">
                        {host ? "Save Changes" : "Create Host"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}