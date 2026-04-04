const express = require("express");
const db = require("../../db");
const auth = require("../../middleware/auth");

const router = express.Router();

// Get current user profile
router.get("/me", auth, async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, username, role, track_activity FROM users WHERE id = ?",
            [req.user.id]
        );
        if (!rows.length) return res.status(404).json({ error: "User not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error("Client me error:", err);
        res.status(500).json({ error: "Internal Error" });
    }
});

// Update tracking setting
router.put("/me/track_activity", auth, async (req, res) => {
    const { track_activity } = req.body;
    try {
        await db.query(
            "UPDATE users SET track_activity = ? WHERE id = ?",
            [track_activity ? 1 : 0, req.user.id]
        );
        res.json({ success: true, track_activity: track_activity ? 1 : 0 });
    } catch (err) {
        console.error("Client track_activity update error:", err);
        res.status(500).json({ error: "Internal Error" });
    }
});

// List all users (organization_user only)
router.get("/", auth, async (req, res) => {
    if (req.user.role !== 'organization_user' && req.user.role !== 'owner') {
        return res.status(403).json({ error: "Forbidden" });
    }
    try {
        const [rows] = await db.query("SELECT id, username, role, track_activity FROM users");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Internal Error" });
    }
});

module.exports = router;
