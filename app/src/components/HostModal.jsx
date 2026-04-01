import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
        identityFile: "",
        passphrase: "",

        useAgent: false,
        identitiesOnly: false,

        jumpHostId: "",
        proxyCommand: ""
    });

    useEffect(() => {
        if (host) {
            setForm(prev => ({
                ...prev,
                ...host
            }));
        }
    }, [host]);

    const update = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const toggleKeyMode = () => {
        update("sshKey", "");
        update("identityFile", "");
    };

    return (
        <div className="modal-overlay">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-content glass-panel fade-in"
            >
                <h2>{host ? "Edit Server Connection" : "Add New Server"}</h2>

                {/* ================= BASIC ================= */}
                <div className="form-group">
                    <label>Name</label>
                    <input
                        value={form.name}
                        onChange={e => update("name", e.target.value)}
                    />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <div className="form-group" style={{ flex: 3 }}>
                        <label>Host</label>
                        <input
                            value={form.host}
                            onChange={e => update("host", e.target.value)}
                        />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Port</label>
                        <input
                            type="number"
                            value={form.port}
                            onChange={e => update("port", Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>User</label>
                    <input
                        value={form.user}
                        onChange={e => update("user", e.target.value)}
                    />
                </div>

                {/* ================= AUTH ================= */}
                <div className="auth-section">
                    <h4>Authentication</h4>

                    <select
                        value={form.authType}
                        onChange={e => update("authType", e.target.value)}
                    >
                        <option value="password">Password</option>
                        <option value="sshKey">SSH Key</option>
                        <option value="agent">SSH Agent</option>
                    </select>

                    {/* PASSWORD */}
                    {form.authType === "password" && (
                        <input
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={e => update("password", e.target.value)}
                        />
                    )}

                    {/* SSH KEY */}
                    {form.authType === "sshKey" && (
                        <>
                            <div className="form-group">
                                <label>Key Mode</label>
                                <select
                                    value={form.identityFile ? "file" : "inline"}
                                    onChange={toggleKeyMode}
                                >
                                    <option value="inline">Paste Key</option>
                                    <option value="file">Use File Path</option>
                                </select>
                            </div>

                            {!form.identityFile && (
                                <textarea
                                    placeholder="Paste private key..."
                                    value={form.sshKey}
                                    onChange={e => update("sshKey", e.target.value)}
                                />
                            )}

                            {form.identityFile !== "" && (
                                <input
                                    placeholder="~/.ssh/id_rsa"
                                    value={form.identityFile}
                                    onChange={e => update("identityFile", e.target.value)}
                                />
                            )}

                            <input
                                type="password"
                                placeholder="Passphrase (optional)"
                                value={form.passphrase}
                                onChange={e => update("passphrase", e.target.value)}
                            />

                            <label>
                                <input
                                    type="checkbox"
                                    checked={form.identitiesOnly}
                                    onChange={e => update("identitiesOnly", e.target.checked)}
                                />
                                IdentitiesOnly
                            </label>
                        </>
                    )}

                    {/* AGENT */}
                    {form.authType === "agent" && (
                        <p style={{ fontSize: 13, opacity: 0.7 }}>
                            Will use system SSH agent (~/.ssh + ssh-agent)
                        </p>
                    )}
                </div>

                {/* ================= PROXY ================= */}
                <div className="jump-section">
                    <h4>Proxy / Jump Host</h4>

                    <select
                        value={form.jumpHostId || ""}
                        onChange={e => update("jumpHostId", e.target.value)}
                    >
                        <option value="">Direct</option>
                        {hosts.map(h => (
                            <option key={h.id} value={h.id}>
                                {h.name} ({h.host})
                            </option>
                        ))}
                    </select>

                    <div className="form-group">
                        <label>Or Custom ProxyCommand</label>
                        <input
                            placeholder="ssh -W %h:%p jump-host"
                            value={form.proxyCommand}
                            onChange={e => update("proxyCommand", e.target.value)}
                        />
                    </div>
                </div>

                {/* ================= ACTIONS ================= */}
                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-cancel">
                        Cancel
                    </button>

                    <button
                        onClick={() => onSave(form)}
                        className="btn btn-save"
                    >
                        {host ? "Save Changes" : "Create"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}