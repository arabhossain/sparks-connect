import { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "xterm/css/xterm.css";

export default function TerminalView({ session }) {
    const ref = useRef(null);
    const termInstance = useRef(null);

    const [menu, setMenu] = useState(null);

    useEffect(() => {
        if (!session?.id) return;

        const term = new Terminal({
            cursorBlink: true,
            convertEol: true,
            fontSize: 14,
            theme: {
                background: "#000000",
            },
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(ref.current);
        fitAddon.fit();

        termInstance.current = term;

        // Listen to backend output
        const eventName = `ssh-output-${session.id}`;
        let unlistenFn;

        listen(eventName, (e) => {
            term.write(e.payload);
        }).then((unlisten) => {
            unlistenFn = unlisten;
        });

        // Send keyboard input to backend
        term.onData((data) => {
            invoke("ssh_write", {
                sessionId: session.id,
                input: data,
            });
        });

        // Resize handling
        const handleResize = () => {
            fitAddon.fit();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            if (unlistenFn) unlistenFn();
            term.dispose();
            window.removeEventListener("resize", handleResize);
        };
    }, [session.id]);

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

    // Close menu on outside click (mousedown for responsiveness)
    useEffect(() => {
        const handleClick = () => closeMenu();

        window.addEventListener("mousedown", handleClick);
        return () => window.removeEventListener("mousedown", handleClick);
    }, []);

    // ---------------------------
    // Middle Mouse Paste Support
    // ---------------------------
    const handleMouseDown = async (e) => {
        // Middle mouse button
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
            style={{ width: "100%", height: "100%", position: "relative" }}
            onContextMenu={handleContextMenu}
            onMouseDown={handleMouseDown}
        >
            {/* Terminal */}
            <div
                ref={ref}
                style={{ width: "100%", height: "100%" }}
            />

            {/* Context Menu */}
            {menu && (
                <div
                    style={{
                        position: "fixed",
                        top: menu.y,
                        left: menu.x,
                        background: "#111",
                        border: "1px solid #333",
                        borderRadius: 6,
                        padding: 6,
                        zIndex: 9999,
                        minWidth: 120,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div style={item} onClick={handleCopy}>
                        📋 Copy
                    </div>
                    <div style={item} onClick={handlePaste}>
                        📥 Paste
                    </div>
                </div>
            )}
        </div>
    );
}

const item = {
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: 13,
    borderRadius: 4,
    color: "#fff",
};