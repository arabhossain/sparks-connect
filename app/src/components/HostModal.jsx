import { useState, useEffect } from "react";

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

    // styles
    const inputStyle = {
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "6px",
        border: "1px solid #333",
        background: "#111",
        color: "#fff",
        outline: "none"
    };

    const selectStyle = {
        ...inputStyle,
        appearance: "none",
        cursor: "pointer"
    };

    const sectionStyle = {
        marginTop: "16px",
        paddingTop: "12px",
        borderTop: "1px solid #333"
    };

    return (
        <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#181818",
            color: "#fff",
            padding: "20px",
            borderRadius: "10px",
            width: "440px",
            maxHeight: "85vh",
            overflowY: "auto",
            boxShadow: "0 0 25px rgba(0,0,0,0.7)"
        }}>

            <h2 style={{ marginBottom: "15px" }}>
                {host ? "Edit Host" : "Add Host"}
            </h2>

            {/* ================= BASIC ================= */}
            <input
                style={inputStyle}
                placeholder="Name"
                value={form.name}
                onChange={e => update("name", e.target.value)}
            />

            <input
                style={inputStyle}
                placeholder="Host (IP / Domain)"
                value={form.host}
                onChange={e => update("host", e.target.value)}
            />

            <input
                style={inputStyle}
                type="number"
                placeholder="Port"
                value={form.port}
                onChange={e => update("port", e.target.value)}
            />

            <input
                style={inputStyle}
                placeholder="User"
                value={form.user}
                onChange={e => update("user", e.target.value)}
            />

            {/* ================= AUTH ================= */}
            <div style={sectionStyle}>
                <h4>Authentication</h4>

                <select
                    style={selectStyle}
                    value={form.authType}
                    onChange={e => update("authType", e.target.value)}
                >
                    <option value="password">Password</option>
                    <option value="sshKey">SSH Key</option>
                    <option value="agent">SSH Agent</option>
                </select>

                {form.authType === "password" && (
                    <input
                        style={inputStyle}
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={e => update("password", e.target.value)}
                    />
                )}

                {form.authType === "sshKey" && (
                    <>
                        <textarea
                            style={{ ...inputStyle, height: "100px" }}
                            placeholder="Private Key"
                            value={form.sshKey}
                            onChange={e => update("sshKey", e.target.value)}
                        />

                        <input
                            style={inputStyle}
                            type="password"
                            placeholder="Key Passphrase"
                            value={form.passphrase}
                            onChange={e => update("passphrase", e.target.value)}
                        />
                    </>
                )}

                {form.authType === "agent" && (
                    <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                            type="checkbox"
                            checked={form.useAgent}
                            onChange={e => update("useAgent", e.target.checked)}
                        />
                        Use SSH Agent
                    </label>
                )}
            </div>

            {/* ================= JUMP HOST ================= */}
            <div style={sectionStyle}>
                <h4>Jump Host</h4>

                <select
                    style={selectStyle}
                    value={form.jumpHostId || ""}
                    onChange={e => update("jumpHostId", e.target.value)}
                >
                    <option value="">-- Select Existing Host --</option>
                    {hosts.map(h => (
                        <option key={h.id} value={h.id}>
                            {h.name} ({h.host})
                        </option>
                    ))}
                </select>
            </div>

            {/* ================= ACTIONS ================= */}
            <div style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px"
            }}>
                <button
                    onClick={() => onSave(form)}
                    style={{
                        padding: "8px 14px",
                        background: "#4caf50",
                        border: "none",
                        borderRadius: "6px",
                        color: "#fff",
                        cursor: "pointer"
                    }}
                >
                    Save
                </button>

                <button
                    onClick={onClose}
                    style={{
                        padding: "8px 14px",
                        background: "#555",
                        border: "none",
                        borderRadius: "6px",
                        color: "#fff",
                        cursor: "pointer"
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}