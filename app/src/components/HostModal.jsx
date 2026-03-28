import { useState, useEffect } from "react";

export default function HostModal({ host, onClose, onSave }) {
    const [form, setForm] = useState({
        name: "",
        host: "",
        user: "",
        authType: "password",
        password: "",
        sshKey: "",
    });

    useEffect(() => {
        if (host) {
            setForm(host);
        }
    }, [host]);

    return (
        <div style={{
            position: "fixed",
            top: 100,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#222",
            color: "#fff",
            padding: 20,
            borderRadius: 8,
            width: 300
        }}>
            <h3>{host ? "Edit Host" : "Add Host"}</h3>

            <input
                placeholder="Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
            />

            <input
                placeholder="Host (IP)"
                value={form.host}
                onChange={e => setForm({ ...form, host: e.target.value })}
            />

            <input
                placeholder="User"
                value={form.user}
                onChange={e => setForm({ ...form, user: e.target.value })}
            />

            <select
                value={form.authType}
                onChange={e => setForm({ ...form, authType: e.target.value })}
            >
                <option value="password">Password</option>
                <option value="sshKey">SSH Key</option>
            </select>

            {form.authType === "password" ? (
                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                />
            ) : (
                <textarea
                    placeholder="Private Key"
                    value={form.sshKey}
                    onChange={e => setForm({ ...form, sshKey: e.target.value })}
                />
            )}

            <div style={{ marginTop: 10 }}>
                <button onClick={() => onSave(form)}>Save</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}