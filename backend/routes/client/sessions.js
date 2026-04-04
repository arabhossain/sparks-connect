const express = require("express");
const db = require("../../db");
const auth = require("../../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    try {
        // If the user's role is organization_user or owner, maybe they can see all sessions?
        // Let's assume organization_user can see all active sessions in the system.
        // team_mate can only see their own.
        const userRole = req.user.role;
        const userId = req.user.id;

        let query = `
            SELECT s.id, s.startedAt, s.lastActive, s.status, u.username, h.name as hostName 
            FROM active_sessions s
            JOIN users u ON s.userId = u.id
            LEFT JOIN hosts h ON s.hostId = h.id
            WHERE 1=1
        `;
        const params = [];

        if (req.query.status) {
            query += " AND s.status = ?";
            params.push(req.query.status);
        }

        if (userRole === 'organization_user') {
            query += " AND u.organizationId = ?";
            params.push(req.user.organizationId);
        } else if (userRole !== 'owner') {
            query += " AND s.userId = ?";
            params.push(userId);
        }

        query += " ORDER BY s.lastActive DESC";

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error("Client sessions error:", err);
        res.status(500).json({ error: "Internal Error" });
    }
});

module.exports = router;
