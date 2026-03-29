import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from "@dnd-kit/core";

import { FiX } from "react-icons/fi";

import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

/* ================= TAB ITEM ================= */

function TabItem({ session, activeSession, onSelect, onClose }) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: session.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    const isActive = session.id === activeSession;

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`tab-item ${isActive ? "active" : ""}`}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
        >
            {/* Drag handle (only this triggers drag) */}
            <span {...listeners} className="drag-handle">⋮⋮</span>

            {/* Status dot */}
            {session.reconnecting ? (
                <span className="spinner" />
            ) : (
                <span
                    className="status-dot"
                    style={{
                        background: session.connected ? "#00ff88" : "#ff4d4f"
                    }}
                />
            )}

            {/* Label */}
            <span
                className="tab-label"
                onClick={() => onSelect(session.id)}
                title={session.host.name}
            >
                {session.host.name}
            </span>

            {/* Close */}
            <span
                className="close-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose(session.id);
                }}
            >
                <FiX size={14} />
            </span>
        </motion.div>
    );
}

/* ================= MAIN TABS ================= */

export default function Tabs({
    sessions,
    setSessions,
    activeSession,
    onSelect,
    onClose
}) {

    const [activeDragId, setActiveDragId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5 // prevents accidental drag on click
            }
        })
    );

    const handleDragStart = (event) => {
        setActiveDragId(event.active.id);
    };

    const handleDragEnd = ({ active, over }) => {
        setActiveDragId(null);

        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = sessions.findIndex(s => s.id === active.id);
            const newIndex = sessions.findIndex(s => s.id === over.id);

            setSessions(arrayMove(sessions, oldIndex, newIndex));
        }
    };

    const activeDragItem = sessions.find(s => s.id === activeDragId);

    return (
        <div className="tab-wrapper">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={sessions.map(s => s.id)}
                    strategy={horizontalListSortingStrategy}
                >
                    <div className="tab-bar">
                        <AnimatePresence>
                            {sessions.map(s => (
                                <TabItem
                                    key={s.id}
                                    session={s}
                                    activeSession={activeSession}
                                    onSelect={onSelect}
                                    onClose={onClose}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </SortableContext>

                {/* Drag Preview (FIXED to cursor) */}
                <DragOverlay
                    dropAnimation={null}
                >
                    {activeDragItem ? (
                        <div className="drag-preview">
                            {activeDragItem.host.name}
                        </div>
                    ) : null}
                </DragOverlay>

            </DndContext>
        </div>
    );
}