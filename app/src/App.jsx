import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./components/Sidebar";
import HostModal from "./components/HostModal";
import TerminalView from "./components/TerminalView";
import Tabs from "./components/Tabs";
import { invoke } from "@tauri-apps/api/core";
import { Toaster, toast } from "react-hot-toast";
import "./styles/tabs.css";
import "./styles/global.css";
import "./styles/login.css";
import { FiTrash2 } from "react-icons/fi";

const API = "https://sparkconnect.codesparks.me";

export default function App() {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [mode, setMode] = useState("login");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = (e) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            let newWidth = e.clientX;
            if (newWidth < 280) newWidth = 280;
            if (newWidth > 600) newWidth = 600;
            setSidebarWidth(newWidth);
        };

        const stopResizing = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", stopResizing);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing]);

    const [hosts, setHosts] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingHost, setEditingHost] = useState(null);

    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);

    const [currentUser, setCurrentUser] = useState(
        localStorage.getItem("username")
    );
    const [confirmDelete, setConfirmDelete] = useState(null);

    const notify = {
        success: (msg) => toast.success(msg),
        error: (msg) => toast.error(msg),
        loading: (msg) => toast.loading(msg),
        dismiss: (id) => toast.dismiss(id)
    };

    useEffect(() => {
        const disableRightClick = (e) => e.preventDefault();
        document.addEventListener("contextmenu", disableRightClick);

        return () => {
            document.removeEventListener("contextmenu", disableRightClick);
        };

    }, []);

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

    useEffect(() => {
        if (!sessions.length || !hosts.length) return;

        const reconnect = async () => {
            for (const s of sessions) {
                try {
                    setSessions(prev =>
                        prev.map(sess =>
                            sess.id === s.id
                                ? { ...sess, reconnecting: true }
                                : sess
                        )
                    );

                    const host = s.host;

                    await invoke("ssh_connect", {
                        sessionId: s.id, // ✅ FIXED

                        host: host.host,
                        user: host.user,
                        password: host.password || null,
                        privateKey: host.sshKey || null,
                        passphrase: host.passphrase || null,

                        jumpHost: buildJumpHost(host),

                        options: {
                            strictHostChecking: false,
                            useKnownHosts: false,
                            allowRsa: true,
                            useAgent: host.authType === "agent"
                        }
                    });

                    setSessions(prev =>
                        prev.map(sess =>
                            sess.id === s.id
                                ? { ...sess, connected: true, reconnecting: false }
                                : sess
                        )
                    );

                } catch (err) {
                    console.error("Reconnect error:", err);

                    setSessions(prev =>
                        prev.map(sess =>
                            sess.id === s.id
                                ? { ...sess, connected: false, reconnecting: false }
                                : sess
                        )
                    );
                }
            }
        };

        reconnect();
    }, [hosts]);

    const handleAuth = async () => {
        const loadingToast = notify.loading(
            mode === "login" ? "Logging in..." : "Registering..."
        );

        try {
            const endpoint = mode === "login" ? "/auth/login" : "/auth/register";

            const res = await fetch(API + endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            notify.dismiss(loadingToast);

            if (mode === "login") {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", username);
                setToken(data.token);

                notify.success("Login successful");
            } else {
                notify.success("Registered successfully");
                setMode("login");
            }
        } catch (err) {
            notify.dismiss(loadingToast);
            notify.error("Authentication failed");
        }
    };

    const logout = () => {
        localStorage.clear();
        setToken(null);
        setSessions([]);
        setActiveSession(null);
        setCurrentUser(null);
    };

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
        const loadingToast = notify.loading("Saving host...");

        try {
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

            notify.dismiss(loadingToast);
            notify.success("Host saved");

            setModalOpen(false);
            setEditingHost(null);
            fetchHosts();
        } catch {
            notify.dismiss(loadingToast);
            notify.error("Failed to save host");
        }
    };

    const buildJumpHost = (host) => {
        if (!host.jumpHostId) return null;

        const jh = hosts.find(h => h.id === host.jumpHostId);
        if (!jh) return null;

        return {
            host: jh.host,
            user: jh.user,
            password: jh.password || null,
            private_key: jh.sshKey || null,
            passphrase: jh.passphrase || null
        };
    };

    const openSession = async (host) => {
        const id = crypto.randomUUID();

        const loadingToast = notify.loading(`Connecting to ${host.host}...`);

        const newSession = {
            id,
            host,
            connected: false,
            reconnecting: true
        };

        setSessions(prev => [...prev, newSession]);
        setActiveSession(id);

        try {
            await invoke("ssh_connect", {
                sessionId: id,
                host: host.host,
                user: host.user,
                password: host.password || null,
                privateKey: host.sshKey || null,
                passphrase: host.passphrase || null,

                jumpHost: buildJumpHost(host),

                options: {
                    strictHostChecking: false,
                    useKnownHosts: false,
                    allowRsa: true,
                    useAgent: host.authType === "agent",

                    identityFile: host.identityFile,
                    identitiesOnly: host.identitiesOnly,
                    proxyCommand: host.proxyCommand
                }
            });

            notify.dismiss(loadingToast);
            notify.success(`Connected to ${host.host}`);

            setSessions(prev =>
                prev.map(s =>
                    s.id === id
                        ? { ...s, connected: true, reconnecting: false }
                        : s
                )
            );

        } catch (err) {
            notify.dismiss(loadingToast);
            notify.error(`Failed to connect: ${host.host}`);

            setSessions(prev =>
                prev.map(s =>
                    s.id === id
                        ? { ...s, connected: false, reconnecting: false }
                        : s
                )
            );

            console.error(err);
        }
    };

    const closeSession = async (sessionId) => {
        try {
            await invoke("ssh_disconnect", { sessionId });
            notify.success("Session closed");
        } catch {
            notify.error("Failed to close session");
        }

        setSessions(prev => {
            const updated = prev.filter(s => s.id !== sessionId);
            if (activeSession === sessionId) {
                setActiveSession(updated[0]?.id || null);
            }
            return updated;
        });
    };

    const importSSH = async () => {
        const loading = notify.loading("Scanning ~/.ssh...");

        try {
            const [keys, hostsFromSSH] = await invoke("scan_ssh");

            let added = 0;

            for (const h of hostsFromSSH) {
                const host = h.hostname || h.host;
                const user = h.user || "root";

                // 🔍 skip duplicates
                const exists = hosts.some(existing =>
                    existing.host === host &&
                    existing.user === user
                );

                if (exists) continue;

                await fetch(`${API}/hosts`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token,
                    },
                    body: JSON.stringify({
                        name: h.host,

                        host: host,
                        port: h.port || 22,
                        user: user,

                        authType: h.identity_file ? "sshKey" : "agent",

                        sshKey: null, // optional: load file later if needed
                        passphrase: null,
                        useAgent: !h.identity_file,

                        identityFile: h.identity_file || null,
                        identitiesOnly: h.identities_only || false,
                        proxyCommand: h.proxy_command || null,

                        proxyJump: h.proxy_jump || null,
                    }),
                });

                added++;
            }

            notify.dismiss(loading);
            notify.success(`Imported ${added} hosts`);

            fetchHosts();

        } catch (err) {
            notify.dismiss(loading);
            notify.error("Failed to import SSH config");
            console.error(err);
        }
    };

    const deleteHost = (host) => {
        setConfirmDelete(host);
    };

    const confirmDeleteAction = async () => {
        const host = confirmDelete;
        if (!host) return;

        setConfirmDelete(null);
        const loadingToast = notify.loading(`Deleting ${host.name}...`);

        try {
            await fetch(`${API}/hosts/${host.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: "Bearer " + token
                }
            });

            notify.dismiss(loadingToast);
            notify.success("Host removed from your network");
            fetchHosts();

        } catch (err) {
            notify.dismiss(loadingToast);
            notify.error("Failed to delete host");
            console.error(err);
        }
    };

    if (!token) {
        return (
            <div className="login-container">
                <div className="background-blur blur-1"></div>
                <div className="background-blur blur-2"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="login-card glass-panel"
                >
                    <div className="login-header">
                        <div className="login-logo">SparkConnect</div>
                        <p>{mode === "login" ? "Welcome back, Commander" : "Join the elite terminal network"}</p>
                    </div>

                    <div className="login-form">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                placeholder="Enter your username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        <button className="btn auth-btn" onClick={handleAuth}>
                            {mode === "login" ? "Sign In" : "Create Account"}
                        </button>

                        <button
                            className="btn switch-btn"
                            onClick={() => setMode(mode === "login" ? "register" : "login")}
                        >
                            {mode === "login"
                                ? "New here? Create an account"
                                : "Already have an account? Sign in"}
                        </button>
                    </div>
                </motion.div>
                <Toaster
                    position="bottom-center"
                    toastOptions={{
                        style: {
                            background: "var(--surface)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "12px",
                            fontSize: "14px",
                        }
                    }}
                />
            </div>
        );
    }

    return (
        <>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: "var(--surface)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                        backdropFilter: "blur(12px)",
                        borderRadius: "12px",
                        fontSize: "14px",
                        padding: "16px",
                        boxShadow: "var(--shadow-lg)",
                    },
                    success: {
                        iconTheme: {
                            primary: "var(--success)",
                            secondary: "white",
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: "var(--danger)",
                            secondary: "white",
                        },
                    },
                }}
            />
            <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
                <Sidebar
                    width={sidebarWidth}
                    hosts={hosts}
                    sessions={sessions}
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
                    importSSH={importSSH}
                    onDelete={deleteHost}
                />

                <div
                    className="resize-handle"
                    onMouseDown={startResizing}
                />

                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "hidden" }}>

                    <Tabs
                        sessions={sessions}
                        setSessions={setSessions}
                        activeSession={activeSession}
                        onSelect={setActiveSession}
                        onClose={closeSession}
                    />

                    <div style={{ flex: 1, overflow: "hidden" }}>
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
                        hosts={hosts}
                        onClose={() => setModalOpen(false)}
                        onSave={saveHost}
                    />
                )}

                <AnimatePresence>
                    {confirmDelete && (
                        <div className="modal-overlay">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="modal-content glass-panel"
                                style={{ maxWidth: "400px", textAlign: "center" }}
                            >
                                <div style={{
                                    background: "rgba(239, 68, 68, 0.1)",
                                    color: "var(--danger)",
                                    width: "64px",
                                    height: "64px",
                                    borderRadius: "16px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 24px auto",
                                    boxShadow: "0 0 20px rgba(239, 68, 68, 0.2)"
                                }}>
                                    <FiTrash2 size={32} />
                                </div>
                                <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>Delete Server?</h3>
                                <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "14px", lineHeight: "1.6" }}>
                                    Are you sure you want to remove <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{confirmDelete.name}</span>?<br />
                                    This will permanently delete the host configuration.
                                </p>
                                <div style={{ display: "flex", gap: "12px" }}>
                                    <button
                                        className="btn secondary-btn"
                                        style={{ flex: 1, padding: "12px", fontWeight: "600" }}
                                        onClick={() => setConfirmDelete(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn primary-btn"
                                        style={{
                                            flex: 1,
                                            padding: "12px",
                                            fontWeight: "600",
                                            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                            border: "none",
                                            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
                                        }}
                                        onClick={confirmDeleteAction}
                                    >
                                        Delete Host
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}