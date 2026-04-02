import React from "react";
import TerminalView from "./TerminalView";

export default function TerminalGrid({ sessions, visibleIds, activeId, layout, onSelect }) {
    const visibleSessions = sessions.filter(s => visibleIds.includes(s.id));

    if (layout === "single") {
        const active = sessions.find(s => s.id === activeId);
        return (
            <div className="terminal-grid single">
                {active && <TerminalView session={active} />}
            </div>
        );
    }

    const gridStyle = {
        display: "grid",
        gridTemplateColumns: layout === "split-v" ? `repeat(${visibleSessions.length}, 1fr)` : "1fr",
        gridTemplateRows: layout === "split-h" ? `repeat(${visibleSessions.length}, 1fr)` : "1fr",
        gap: "2px",
        background: "var(--border-subtle)",
        height: "100%",
        width: "100%",
    };

    return (
        <div className="terminal-grid" style={gridStyle}>
            {visibleSessions.map(s => (
                <div
                    key={s.id}
                    className={`terminal-pane ${s.id === activeId ? "active" : ""}`}
                    onClick={() => onSelect(s.id)}
                    style={{
                        position: "relative",
                        overflow: "hidden",
                        background: "var(--background)",
                        border: s.id === activeId ? "2px solid var(--primary)" : "2px solid transparent",
                        transition: "border-color 0.2s ease"
                    }}
                >
                    <TerminalView session={s} />
                </div>
            ))}
        </div>
    );
}
