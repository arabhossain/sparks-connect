import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "xterm/css/xterm.css";

export default function TerminalView({ session }) {
    const ref = useRef(null);
    const termRef = useRef(null);

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

        termRef.current = term;

        // listen to session-specific stream
        const eventName = `ssh-output-${session.id}`;

        let unlistenFn;

        listen(eventName, (e) => {
            term.write(e.payload);
        }).then((unlisten) => {
            unlistenFn = unlisten;
        });

        // send input to backend
        term.onData((data) => {
            invoke("ssh_write", {
                sessionId: session.id,
                input: data,
            });
        });

        // optional resize handling
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

    return <div style={{ width: "100%", height: "100%" }} ref={ref} />;
}