import { useState } from "react";

export default function Sidebar({ hosts, onConnect, onAdd, onEdit, onLogout }) {
    const [search, setSearch] = useState("");
    const username = localStorage.getItem("username");

    const filtered = hosts.filter(h =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.host.includes(search)
    );

    return (
        <div style={{
            width: 260,
            background: "#0a0a0a",
            color: "#fff",
            padding: 10,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            borderRight: "1px solid #111"
        }}>
            {/* Header */}
            <div>
                <h3 style={{ margin: "5px 0" }}>Hosts</h3>

                <input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        padding: 6,
                        width: "100%",
                        background: "#111",
                        border: "1px solid #333",
                        color: "#fff",
                        borderRadius: 4
                    }}
                />

                <button
                    onClick={onAdd}
                    style={{
                        marginTop: 8,
                        width: "100%",
                        padding: 6,
                        background: "#1f6feb",
                        border: "none",
                        color: "#fff",
                        borderRadius: 4,
                        cursor: "pointer"
                    }}
                >
                    + Add Host
                </button>
            </div>

            {/* Hosts list */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                marginTop: 10
            }}>
                {filtered.map((h) => (
                    <div
                        key={h.id}
                        style={{
                            border: "1px solid #222",
                            padding: 10,
                            borderRadius: 6,
                            marginBottom: 8,
                            background: "#111",
                            cursor: "pointer"
                        }}
                        onDoubleClick={() => onConnect(h)}
                    >
                        <div style={{ fontWeight: "bold" }}>
                            {h.name}
                        </div>

                        <div style={{ fontSize: 12, opacity: 0.7 }}>
                            {h.host}
                        </div>

                        <div style={{
                            marginTop: 6,
                            display: "flex",
                            gap: 6
                        }}>
                            <button
                                onClick={() => onConnect(h)}
                                style={btnStyle}
                            >
                                Connect
                            </button>

                            <button
                                onClick={() => onEdit(h)}
                                style={btnStyle}
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer (User + Logout) */}
            <div style={{
                borderTop: "1px solid #222",
                paddingTop: 10
            }}>
                <div style={{
                    fontSize: 12,
                    opacity: 0.7,
                    marginBottom: 6
                }}>
                    👤 {username}
                </div>

                <button
                    onClick={onLogout}
                    style={{
                        width: "100%",
                        padding: 6,
                        background: "#ff4d4f",
                        border: "none",
                        color: "#fff",
                        borderRadius: 4,
                        cursor: "pointer"
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

// Reusable button style
const btnStyle = {
    flex: 1,
    padding: "4px 6px",
    fontSize: 12,
    background: "#222",
    border: "1px solid #333",
    color: "#fff",
    borderRadius: 4,
    cursor: "pointer"
};