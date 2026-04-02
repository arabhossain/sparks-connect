import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiTerminal, FiPlus, FiSettings, FiLogOut, FiMoon, FiSun } from "react-icons/fi";
import "../styles/palette.css";

export default function CommandPalette({ isOpen, onClose, hosts, onConnect, onAdd, onLogout }) {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    const actions = [
        { id: "add", icon: <FiPlus />, label: "Add New Host", action: onAdd },
        { id: "logout", icon: <FiLogOut />, label: "Logout", action: onLogout, danger: true },
        // Add more global actions here
    ];

    const hostResults = hosts
        .filter(h => h.name.toLowerCase().includes(query.toLowerCase()) || h.host.toLowerCase().includes(query.toLowerCase()))
        .map(h => ({ id: `host-${h.id}`, icon: <FiTerminal />, label: h.name, subLabel: `${h.user}@${h.host}`, action: () => onConnect(h) }));

    const filteredResults = query ? [...hostResults, ...actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))] : actions;

    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            setSelectedIndex(prev => (prev + 1) % filteredResults.length);
            e.preventDefault();
        } else if (e.key === "ArrowUp") {
            setSelectedIndex(prev => (prev - 1 + filteredResults.length) % filteredResults.length);
            e.preventDefault();
        } else if (e.key === "Enter") {
            filteredResults[selectedIndex]?.action();
            onClose();
        } else if (e.key === "Escape") {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="palette-overlay" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="palette-content glass-panel"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="palette-search">
                            <FiSearch className="search-icon" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search hosts or commands..."
                            />
                            <div className="kbd-hint">ESC</div>
                        </div>

                        <div className="palette-results">
                            {filteredResults.length > 0 ? (
                                filteredResults.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className={`palette-item ${idx === selectedIndex ? "selected" : ""} ${item.danger ? "danger" : ""}`}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        onClick={() => { item.action(); onClose(); }}
                                    >
                                        <div className="item-icon">{item.icon}</div>
                                        <div className="item-info">
                                            <div className="item-label">{item.label}</div>
                                            {item.subLabel && <div className="item-sublabel">{item.subLabel}</div>}
                                        </div>
                                        {idx === selectedIndex && <div className="enter-hint">↵</div>}
                                    </div>
                                ))
                            ) : (
                                <div className="palette-empty">No results found for "{query}"</div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
