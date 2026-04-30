import { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "xterm/css/xterm.css";
import "../styles/terminal.css";
import { FiCopy, FiClipboard } from "react-icons/fi";

export default function TerminalView({ session, isVisible = true }) {
    const ref = useRef(null);
    const termInstance = useRef(null);
    const fitAddonRef = useRef(null);
    const sessionRef = useRef(session);

    useEffect(() => {
        sessionRef.current = session;
    }, [session]);

    const [menu, setMenu] = useState(null);
    const [showOverlay, setShowOverlay] = useState(true);
    const isConnectingRef = useRef(true);

    useEffect(() => {
        if (!session?.id) return;

        const term = new Terminal({
            cursorBlink: true,
            convertEol: true,
            fontSize: 14,
            lineHeight: 1.2,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            theme: {
                background: "#0a0b10", // Match var(--bg-primary)
                foreground: "#f8fafc", // Match var(--text-primary)
                cursor: "#737373",     // Subtle grey cursor like screenshot
                selection: "rgba(59, 130, 246, 0.3)",
                black: "#1e293b",
                red: "#ef4444",
                green: "#27c93f",      // Bright terminal green
                yellow: "#f59e0b",
                blue: "#3b82f6",
                magenta: "#8b5cf6",
                cyan: "#06b6d4",
                white: "#f8fafc",
            },
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        fitAddonRef.current = fitAddon;

        term.open(ref.current);

        // Small delay to ensure the DOM is ready for measurement
        setTimeout(() => {
            if (ref.current && term.element) {
                try {
                    fitAddon.fit();
                } catch (e) {
                    console.warn("fitAddon.fit() failed during init:", e);
                }
            }
        }, 100);

        termInstance.current = term;

        // Listen to backend output
        const eventName = `ssh-output-${session.id}`;
        let unlistenFn;

        listen(eventName, (e) => {
            if (isConnectingRef.current) {
                isConnectingRef.current = false;
                setShowOverlay(false);
            }
            term.write(e.payload);
        }).then((unlisten) => {
            unlistenFn = unlisten;
        });

        let commandBuffer = "";

        // Send keyboard input to backend
        term.onData((data) => {
            if (isConnectingRef.current) return; // Block input while connecting

            invoke("ssh_write", {
                sessionId: session.id,
                input: data,
            });

            if (data === '\r') {
                if (commandBuffer.trim().length > 0) {
                    let deviceId = localStorage.getItem("deviceId");
                    if (!deviceId) {
                        deviceId = crypto.randomUUID();
                        localStorage.setItem("deviceId", deviceId);
                    }
                    fetch("http://localhost:4000/telemetry/log", {
                        method: "POST",
                        headers: { 
                            "Content-Type": "application/json", 
                            "Authorization": "Bearer " + localStorage.getItem("token") 
                        },
                        body: JSON.stringify({ 
                            action: "COMMAND", 
                            sessionId: sessionRef.current.serverId,
                            details: {
                                command: commandBuffer.trim(),
                                deviceId,
                                hostId: sessionRef.current.host?.id,
                                hostName: sessionRef.current.host?.name
                            }
                        })
                    }).catch(() => {});
                }
                commandBuffer = "";
            } else if (data === '\x7f') { // backspace
                commandBuffer = commandBuffer.slice(0, -1);
            } else {
                commandBuffer += data;
            }
        });

        // Use ResizeObserver for more robust resizing
        const resizeObserver = new ResizeObserver(() => {
            if (isVisible && term.element && ref.current) {
                if (ref.current.clientWidth < 10 || ref.current.clientHeight < 10) return;
                try {
                    fitAddon.fit();
                    invoke("ssh_resize", {
                        sessionId: session.id,
                        rows: term.rows,
                        cols: term.cols,
                    }).catch(() => { });
                } catch (e) {
                    // Ignore transient resize errors
                }
            }
        });

        if (ref.current) {
            resizeObserver.observe(ref.current);
        }

        return () => {
            if (unlistenFn) unlistenFn();
            resizeObserver.disconnect();
            term.dispose();
        };
    }, [session.id]);

    // Force fit when visibility changes
    useEffect(() => {
        if (isVisible && termInstance.current && fitAddonRef.current) {
            setTimeout(() => {
                if (ref.current && (ref.current.clientWidth < 10 || ref.current.clientHeight < 10)) return;
                try {
                    fitAddonRef.current.fit();
                    termInstance.current.focus();
                    invoke("ssh_resize", {
                        sessionId: session.id,
                        rows: termInstance.current.rows,
                        cols: termInstance.current.cols,
                    }).catch(() => { });
                } catch (e) { }
            }, 50);
        }
    }, [isVisible]);

    // ---------------------------
    // Right Click Menu
    // ---------------------------
    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();

        setMenu({
            x: e.clientX,
            y: e.clientY,
        });
    };

    const closeMenu = () => setMenu(null);

    const handleCopy = async () => {
        const text = termInstance.current?.getSelection();

        if (text) {
            await navigator.clipboard.writeText(text);
        }

        closeMenu();
    };

    const handlePaste = async () => {
        const text = await navigator.clipboard.readText();

        if (text) {
            invoke("ssh_write", {
                sessionId: session.id,
                input: text,
            });
        }

        closeMenu();
    };

    // Close menu on outside click
    useEffect(() => {
        const handleClick = () => closeMenu();

        window.addEventListener("mousedown", handleClick);
        return () => window.removeEventListener("mousedown", handleClick);
    }, []);

    // ---------------------------
    // Middle Mouse Paste Support
    // ---------------------------
    const handleMouseDown = async (e) => {
        if (e.button === 1) {
            e.preventDefault();

            const text = await navigator.clipboard.readText();

            if (text) {
                invoke("ssh_write", {
                    sessionId: session.id,
                    input: text,
                });
            }
        }
    };

    return (
        <div
            className="terminal-container"
            onContextMenu={handleContextMenu}
            onMouseDown={handleMouseDown}
            style={{ background: "#050505" }}
        >
            <div className="terminal-window-wrapper">
                <div className="terminal-window">
                    <div className="terminal-content">
                        {showOverlay && (
                            <div className="terminal-loading-overlay">
                                <div className="terminal-spinner"></div>
                                <span>Establishing secure connection...</span>
                            </div>
                        )}
                        <div
                            ref={ref}
                            style={{ width: "100%", height: "100%" }}
                        />
                    </div>
                </div>
            </div>

            {/* Context Menu */}
            {menu && (
                <div
                    className="context-menu glass-panel"
                    style={{
                        top: menu.y,
                        left: menu.x,
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div className="menu-item" onClick={handleCopy}>
                        <FiCopy size={14} /> Copy
                    </div>
                    <div className="menu-item" onClick={handlePaste}>
                        <FiClipboard size={14} /> Paste
                    </div>
                </div>
            )}
        </div>
    );
}