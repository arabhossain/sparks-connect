import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import HostModal from "./components/HostModal";
import TerminalView from "./components/TerminalView";
import Tabs from "./components/Tabs";
import { invoke } from "@tauri-apps/api/core";
import "./styles/tabs.css";
const API = "http://localhost:4000";

export default function App() {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [mode, setMode] = useState("login");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [hosts, setHosts] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingHost, setEditingHost] = useState(null);

    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);

    const [currentUser, setCurrentUser] = useState(
        localStorage.getItem("username")
    );

    // ================= GLOBAL =================
    useEffect(() => {
        document.body.style.margin = "0";
        document.body.style.background = "#000";
    }, []);

    // ================= LOAD SESSIONS =================
    useEffect(() => {
        const saved = localStorage.getItem("sessions");
        if (saved) {
            const parsed = JSON.parse(saved);
            setSessions(parsed);
            if (parsed.length > 0) setActiveSession(parsed[0].id);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("sessions", JSON.stringify(sessions));
    }, [sessions]);

    // ================= RECONNECT =================
    useEffect(() => {
        sessions.forEach(async (s) => {
            try {
                setSessions(prev =>
                    prev.map(sess =>
                        sess.id === s.id
                            ? { ...sess, reconnecting: true }
                            : sess
                    )
                );

                const host = s.host;

                if (host.authType === "sshKey") {
                    await invoke("ssh_connect_key", {
                        sessionId: s.id,
                        host: host.host,
                        user: host.user,
                        privateKey: host.sshKey,
                    });
                } else {
                    await invoke("ssh_connect", {
                        sessionId: s.id,
                        host: host.host,
                        user: host.user,
                        password: host.password,
                    });
                }

                setSessions(prev =>
                    prev.map(sess =>
                        sess.id === s.id
                            ? { ...sess, connected: true, reconnecting: false }
                            : sess
                    )
                );

            } catch (err) {
                setSessions(prev =>
                    prev.map(sess =>
                        sess.id === s.id
                            ? { ...sess, connected: false, reconnecting: false }
                            : sess
                    )
                );
            }
        });
    }, []);

    // ================= AUTH =================
    const handleAuth = async () => {
        const endpoint = mode === "login" ? "/auth/login" : "/auth/register";

        const res = await fetch(API + endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (mode === "login") {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", username);
            setToken(data.token);
        } else {
            alert("Registered successfully");
            setMode("login");
        }
    };

    const logout = () => {
        localStorage.clear();
        setToken(null);
        setSessions([]);
        setActiveSession(null);
        setCurrentUser(null);
    };

    // ================= HOSTS =================
    const fetchHosts = async () => {
        const res = await fetch(API + "/hosts", {
            headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        setHosts(data);
    };

    useEffect(() => {
        if (token) fetchHosts();
    }, [token]);

    const saveHost = async (host) => {
        const url = editingHost
            ? `${API}/hosts/${editingHost.id}`
            : `${API}/hosts`;

        await fetch(url, {
            method: editingHost ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            body: JSON.stringify(host),
        });

        setModalOpen(false);
        setEditingHost(null);
        fetchHosts();
    };

    // ================= SSH =================
    const openSession = async (host) => {
        const id = crypto.randomUUID();

        const newSession = {
            id,
            host,
            connected: false,
            reconnecting: true
        };

        setSessions(prev => [...prev, newSession]);
        setActiveSession(id);

        try {
            if (host.authType === "sshKey") {
                await invoke("ssh_connect_key", {
                    sessionId: id,
                    host: host.host,
                    user: host.user,
                    privateKey: host.sshKey,
                });
            } else {
                await invoke("ssh_connect", {
                    sessionId: id,
                    host: host.host,
                    user: host.user,
                    password: host.password,
                });
            }

            setSessions(prev =>
                prev.map(s =>
                    s.id === id
                        ? { ...s, connected: true, reconnecting: false }
                        : s
                )
            );

        } catch (err) {
            console.error(err);
        }
    };

    const closeSession = async (sessionId) => {
        try {
            await invoke("ssh_disconnect", { sessionId });
        } catch {}

        setSessions(prev => {
            const updated = prev.filter(s => s.id !== sessionId);
            if (activeSession === sessionId) {
                setActiveSession(updated[0]?.id || null);
            }
            return updated;
        });
    };

    // ================= LOGIN UI =================
    if (!token) {
        return (
            <div style={{
                display: "flex",
                height: "100vh",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                background: "#000",
                color: "#fff",
                gap: 10
            }}>
                <h2>{mode}</h2>

                <input placeholder="Username"
                       value={username}
                       onChange={e => setUsername(e.target.value)} />

                <input type="password"
                       placeholder="Password"
                       value={password}
                       onChange={e => setPassword(e.target.value)} />

                <button onClick={handleAuth}>Submit</button>

                <button onClick={() =>
                    setMode(mode === "login" ? "register" : "login")
                }>
                    Switch
                </button>
            </div>
        );
    }

    // ================= MAIN =================
    return (
        <div style={{ display: "flex", height: "100vh", background: "#000" }}>

            <Sidebar
                hosts={hosts}
                onConnect={openSession}
                onAdd={() => {
                    setEditingHost(null);
                    setModalOpen(true);
                }}
                onEdit={(h) => {
                    setEditingHost(h);
                    setModalOpen(true);
                }}
                onLogout={logout}
            />

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

                <Tabs
                    sessions={sessions}
                    setSessions={setSessions}
                    activeSession={activeSession}
                    onSelect={setActiveSession}
                    onClose={closeSession}
                />

                <div style={{ flex: 1 }}>
                    {sessions.map(s => (
                        <div
                            key={s.id}
                            style={{
                                display: s.id === activeSession ? "block" : "none",
                                height: "100%"
                            }}
                        >
                            <TerminalView session={s} />
                        </div>
                    ))}
                </div>

            </div>

            {modalOpen && (
                <HostModal
                    host={editingHost}
                    hosts={hosts}   // 👈 ADD THIS
                    onClose={() => setModalOpen(false)}
                    onSave={saveHost}
                />
            )}
        </div>
    );
}