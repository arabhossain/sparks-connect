import { useState } from "react";
import { FiSearch, FiPlus, FiTrash2, FiEdit2, FiTerminal, FiKey } from "react-icons/fi";

export default function Sidebar({
                                    hosts,
                                    onConnect,
                                    onAdd,
                                    onEdit,
                                    onDelete,
                                    onLogout,
                                    importSSH
                                }) {
    const [search, setSearch] = useState("");
    const username = localStorage.getItem("username");

    const filtered = hosts.filter(h =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.host.includes(search)
    );

    return (
        <div style={container}>
            {/* HEADER */}
            <div>
                <h3 style={{ marginBottom: 8 }}>Hosts</h3>

                {/* SEARCH */}
                <div style={searchBox}>
                    <FiSearch size={14} />
                    <input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={searchInput}
                    />
                </div>

                {/* ACTIONS */}
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <button onClick={onAdd} style={primaryBtn}>
                        <FiPlus size={14} /> Add
                    </button>

                    <button onClick={importSSH} style={ghostBtn}>
                        <FiKey size={14} /> Import
                    </button>
                </div>
            </div>

            {/* HOST LIST */}
            <div style={list}>
                {filtered.map((h) => (
                    <div
                        key={h.id}
                        style={card}
                        onDoubleClick={() => onConnect(h)}
                    >
                        <div style={title}>{h.name}</div>
                        <div style={subtitle}>{h.user}@{h.host}</div>

                        <div style={actions}>
                            <IconBtn onClick={() => onConnect(h)}>
                                <FiTerminal />
                            </IconBtn>

                            <IconBtn onClick={() => onEdit(h)}>
                                <FiEdit2 />
                            </IconBtn>

                            <IconBtn danger onClick={() => onDelete(h)}>
                                <FiTrash2 />
                            </IconBtn>
                        </div>
                    </div>
                ))}
            </div>

            {/* FOOTER */}
            <div style={footer}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                    👤 {username}
                </div>

                <button onClick={onLogout} style={logoutBtn}>
                    Logout
                </button>
            </div>
        </div>
    );
}

/* ---------- UI STYLES ---------- */

const container = {
    width: 260,
    background: "#0d1117",
    color: "#fff",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #111"
};

const searchBox = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#111",
    border: "1px solid #222",
    padding: "4px 6px",
    borderRadius: 6
};

const searchInput = {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#fff",
    width: "100%",
    fontSize: 12
};

const primaryBtn = {
    flex: 1,
    padding: 6,
    background: "#238636",
    border: "none",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4
};

const ghostBtn = {
    flex: 1,
    padding: 6,
    background: "#161b22",
    border: "1px solid #333",
    color: "#ccc",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4
};

const list = {
    flex: 1,
    overflowY: "auto",
    marginTop: 12,
    minHeight: 0,
};

const card = {
    border: "1px solid #222",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    background: "#111",
    transition: "0.2s",
};

const title = {
    fontWeight: "bold",
    fontSize: 13
};

const subtitle = {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 2
};

const actions = {
    display: "flex",
    gap: 6,
    marginTop: 8
};

const IconBtn = ({ children, onClick, danger }) => (
    <button
        onClick={onClick}
        style={{
            flex: 1,
            padding: 5,
            background: danger ? "#2d1111" : "#161b22",
            border: "1px solid #333",
            color: danger ? "#ff6b6b" : "#ccc",
            borderRadius: 6,
            cursor: "pointer",
        }}
    >
        {children}
    </button>
);

const footer = {
    borderTop: "1px solid #222",
    paddingTop: 10,
    marginTop: 10,
    display: "flex",
    flexDirection: "column",
    gap: 6
};

const logoutBtn = {
    padding: 6,
    background: "#da3633",
    border: "none",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12
};