const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

// POST /telemetry/session
// Used by the app to create or update an active session heartbeat
router.post("/session", auth, async (req, res) => {
    const { hostId, status } = req.body;
    const userId = req.user.id;

    try {
        // Try to update existing active session for this user + host OR insert
        const [existing] = await db.query(
            "SELECT id FROM active_sessions WHERE userId = ? AND hostId = ? AND status = 'active'",
            [userId, hostId]
        );

        if (existing.length) {
            // Heartbeat
            await db.query(
                "UPDATE active_sessions SET lastActive = CURRENT_TIMESTAMP, status = ? WHERE id = ?",
                [status || 'active', existing[0].id]
            );
            return res.json({ id: existing[0].id, session: 'updated' });
        } else {
            // New Session
            const sessionId = crypto.randomUUID();
            await db.query(
                "INSERT INTO active_sessions (id, userId, hostId, status) VALUES (?, ?, ?, ?)",
                [sessionId, userId, hostId, status || 'active']
            );
            return res.json({ id: sessionId, session: 'created' });
        }
    } catch (err) {
        console.error("Session telemetry error:", err);
        return res.status(500).json({ error: "Internal Error" });
    }
});

// POST /telemetry/log
// Used by the app to record an action (only if tracking is enabled)
router.post("/log", auth, async (req, res) => {
    const { action, details, sessionId } = req.body;
    const userId = req.user.id;

    try {
        // First check user's track_activity
        const [users] = await db.query("SELECT role, track_activity FROM users WHERE id = ?", [userId]);
        if (!users.length) return res.status(401).json({ error: "User not found" });
        
        const user = users[0];
        
        // Only log if track_activity is true, or if there is organizational logic.
        if (!user.track_activity) {
             return res.json({ status: 'ignored', reason: 'tracking_disabled' });
        }

        const logId = crypto.randomUUID();
        const detailsStr = typeof details === "object" ? JSON.stringify(details) : (details || "");
        
        await db.query(
            "INSERT INTO activity_logs (id, userId, sessionId, action, details) VALUES (?, ?, ?, ?, ?)",
            [logId, userId, sessionId || null, action, detailsStr]
        );
        return res.json({ id: logId, status: 'logged' });
    } catch (err) {
        console.error("Log telemetry error:", err);
        return res.status(500).json({ error: "Internal Error" });
    }
});

module.exports = router;
