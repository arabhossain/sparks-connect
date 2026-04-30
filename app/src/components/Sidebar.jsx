import { useState, useRef, useEffect } from "react";
import { FiSearch, FiPlus, FiTrash2, FiEdit2, FiTerminal, FiKey, FiUser, FiX, FiFolderPlus, FiCheck, FiRefreshCw, FiLogOut, FiCode, FiLayout } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import "../styles/sidebar.css";

function DraggableHost({ host, status, count, children }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: host.id,
        data: host
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 1000 : 1
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
}

function DroppableFolder({ folder, groupId, collapsed, count, onToggle, onDelete, isSystemGroup }) {
    const { isOver, setNodeRef } = useDroppable({
        id: folder,
    });

    return (
        <div
            ref={setNodeRef}
            className={`folder-header ${collapsed ? "collapsed" : ""} ${isOver ? "drop-over" : ""}`}
            onClick={onToggle}
        >
            <span className="folder-icon">
                {collapsed ? "▸" : "▾"}
            </span>
            <span className="folder-name">{folder}</span>
            <span className="folder-count">{count}</span>
            {isOver && <div className="drop-indicator">Drop here</div>}

            {!isSystemGroup && (
                <button
                    className="folder-delete-btn"
                    onClick={(e) => { e.stopPropagation(); onDelete(groupId); }}
                    title="Delete Group"
                >
                    <FiTrash2 size={12} />
                </button>
            )}
        </div>
    );
}

export default function Sidebar({
    width = 280,
    hosts,
    sessions = [],
    onConnect,
    onAdd,
    onEdit,
    onDelete,
    onLogout,
    importSSH,
    onStopHostSessions,
    onMoveHost,
    groups = [],
    onCreateGroup,
    onDeleteGroup,
    onRefresh,
    onOpenSnippets,
    onOpenWorkspaces
}) {
    const [search, setSearch] = useState("");
    const [collapsedFolders, setCollapsedFolders] = useState({});
    const [isAddingGroup, setIsAddingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [showUserMenu, setShowUserMenu] = useState(false);
    const groupInputRef = useRef(null);
    const username = localStorage.getItem("username");

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        if (isAddingGroup && groupInputRef.current) {
            groupInputRef.current.focus();
        }
    }, [isAddingGroup]);

    const filtered = (hosts || []).filter(h =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.host.includes(search)
    );

    // Grouping logic: Start with all official groups
    const groupedData = {};

    // 1. Add all groups from backend
    (groups || []).forEach(g => {
        if (g && g.name) {
            groupedData[g.name] = { id: g.id, hosts: [], isSystem: false };
        }
    });

    // 2. Add Ungrouped explicitly
    if (!groupedData["Ungrouped"]) {
        groupedData["Ungrouped"] = { id: "system-ungrouped", hosts: [], isSystem: true };
    }

    // 3. Fill with hosts (match by name, case-insensitive for 'Ungrouped')
    filtered.forEach(h => {
        let groupName = h.group || "Ungrouped";

        // Find existing group by name (case-insensitive)
        const existingKey = Object.keys(groupedData).find(
            k => k.toLowerCase() === groupName.toLowerCase()
        );

        if (existingKey) {
            groupName = existingKey;
        } else {
            groupedData[groupName] = { id: null, hosts: [], isSystem: true };
        }

        groupedData[groupName].hosts.push(h);
    });

    const toggleFolder = (folder) => {
        setCollapsedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const hostId = active.id;
            const newGroup = over.id === "Ungrouped" ? null : over.id;
            onMoveHost(hostId, newGroup);
        }
    };

    const handleAddGroup = () => {
        if (newGroupName.trim()) {
            onCreateGroup(newGroupName.trim());
            setNewGroupName("");
            setIsAddingGroup(false);
        }
    };

    const getSessionCount = (hostId) => {
        return sessions.filter(s => s.id === hostId || s.host?.id === hostId).length;
    };

    const getStatus = (host) => {
        const session = sessions.find(s => s.host?.id === host.id);
        if (!session) return "offline";
        return session.connected ? "connected" : "error";
    };

    return (
        <div className="sidebar-container glass-panel" style={{ width: width }}>
            <div className="sidebar-header">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h3>Hosts</h3>
                    <button onClick={onRefresh} className="icon-btn" title="Refresh">
                        <FiRefreshCw size={14} />
                    </button>
                </div>
                <div className="search-container">
                    <FiSearch size={14} color="var(--text-muted)" />
                    <input
                        placeholder="Search servers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="sidebar-actions">
                    <button onClick={onAdd} className="sidebar-btn primary-btn">
                        <FiPlus size={16} /> New Host
                    </button>
                    <button onClick={() => setIsAddingGroup(true)} className="sidebar-btn secondary-btn" title="Create Group">
                        <FiFolderPlus size={16} /> Group
                    </button>
                </div>
                <div className="sidebar-actions" style={{ marginTop: '8px' }}>
                    <button onClick={onOpenSnippets} className="sidebar-btn secondary-btn" style={{ flex: 1 }}>
                        <FiCode size={14} style={{ marginRight: '4px' }} /> Snippets
                    </button>
                    <button onClick={onOpenWorkspaces} className="sidebar-btn secondary-btn" style={{ flex: 1 }}>
                        <FiLayout size={14} style={{ marginRight: '4px' }} /> Workspaces
                    </button>
                </div>
            </div>

            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="host-list">
                    {isAddingGroup && (
                        <div className="inline-group-input glass-panel">
                            <FiFolderPlus size={14} className="prefix-icon" />
                            <input
                                ref={groupInputRef}
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
                                placeholder="Group Name..."
                            />
                            <div className="actions">
                                <button className="confirm" onClick={handleAddGroup} title="Confirm"><FiCheck size={14} /></button>
                                <button className="cancel" onClick={() => setIsAddingGroup(false)} title="Cancel"><FiX size={14} /></button>
                            </div>
                        </div>
                    )}

                    {Object.entries(groupedData)
                        .filter(([name, data]) => !(name === "Ungrouped" && data.hosts.length === 0))
                        .sort(([nameA], [nameB]) => {
                            if (nameA === "Ungrouped") return -1;
                            if (nameB === "Ungrouped") return 1;
                            return nameA.localeCompare(nameB);
                        })
                        .map(([name, data]) => (
                            <div key={name} className="folder-group">
                                <DroppableFolder
                                    folder={name}
                                    groupId={data.id}
                                    collapsed={collapsedFolders[name]}
                                    count={data.hosts.length}
                                    onToggle={() => toggleFolder(name)}
                                    onDelete={onDeleteGroup}
                                    isSystemGroup={data.isSystem}
                                />

                                {!collapsedFolders[name] && (
                                    <AnimatePresence>
                                        {data.hosts.map((h, index) => {
                                            const status = getStatus(h);
                                            const count = getSessionCount(h.id);

                                            return (
                                                <DraggableHost
                                                    key={h.id}
                                                    host={h}
                                                >
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        transition={{ delay: index * 0.03 }}
                                                        className="host-card glow-border"
                                                        onDoubleClick={() => onConnect(h)}
                                                    >
                                                        <div className="host-card-inner">
                                                            <div className="host-icon-main">
                                                                <FiTerminal size={20} />
                                                            </div>
                                                            <div className="host-info-main">
                                                                <div className="host-name-row">
                                                                    <span className="host-name">{h.name}</span>
                                                                    <div className={`status-dot-indicator ${status}`}></div>
                                                                    {count > 0 && <span className="session-count-badge">{count}</span>}
                                                                </div>
                                                                <div className="host-details">{h.user}@{h.host}</div>
                                                            </div>
                                                            {count > 0 && (
                                                                <button
                                                                    className="close-all-host-btn"
                                                                    onClick={(e) => { e.stopPropagation(); onStopHostSessions(h.id); }}
                                                                >
                                                                    <FiX size={14} />
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="card-actions">
                                                            <button className="icon-btn" title="Connect" onClick={(e) => { e.stopPropagation(); onConnect(h); }}>
                                                                <FiTerminal size={14} />
                                                            </button>
                                                            <button className="icon-btn" title="Edit" onClick={(e) => { e.stopPropagation(); onEdit(h); }}>
                                                                <FiEdit2 size={14} />
                                                            </button>
                                                            <button className="icon-btn danger" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(h); }}>
                                                                <FiTrash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                </DraggableHost>
                                            );
                                        })}
                                    </AnimatePresence>
                                )}
                            </div>
                        ))}
                </div>
            </DndContext>

            <div className="sidebar-footer">
                <div className="user-info" onClick={() => setShowUserMenu(!showUserMenu)}>
                    <FiUser size={16} />
                    <span className="user-name">{username || 'Guest'}</span>
                </div>
                <button onClick={onLogout} className="logout-btn" title="Logout">
                    <FiLogOut size={16} />
                </button>

                <AnimatePresence>
                    {showUserMenu && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{
                                position: 'absolute',
                                bottom: '100%',
                                left: '0',
                                width: '100%',
                                marginBottom: '12px',
                                background: 'rgba(20, 20, 20, 0.95)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '16px',
                                zIndex: 100,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                            }}
                        >
                            <div style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '12px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{username || 'Guest'}</div>
                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{username ? `${username}@sparksconnect.io` : 'guest@local'}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                    <span style={{ color: '#9ca3af' }}>Account Type</span>
                                    <span style={{ background: 'linear-gradient(135deg, #a855f7 0%, #f97316 100%)', WebkitBackgroundClip: 'text', color: 'transparent', fontWeight: 'bold' }}>PRO</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                    <span style={{ color: '#9ca3af' }}>Team</span>
                                    <span style={{ color: '#fff' }}>Personal Workspace</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                    <span style={{ color: '#9ca3af' }}>API Route</span>
                                    <span style={{ color: '#22c55e' }}>Healthy</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}