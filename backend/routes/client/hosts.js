const express = require("express");
const db = require("../../db");
const auth = require("../../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    try {
        let query = "";
        let params = [];

        if (req.user.role === 'team_mate' && req.user.organizationId) {
            const [orgRows] = await db.query("SELECT ownerId FROM organizations WHERE id = ?", [req.user.organizationId]);
            if (!orgRows.length) return res.json([]);
            query = `
                SELECT DISTINCT h.id, h.name, h.host as ip, h.user, h.isShared, h.ownerId, h.port 
                FROM hosts h
                JOIN team_group_hosts tgh ON h.id = tgh.hostId
                JOIN team_group_members tgm ON tgh.groupId = tgm.groupId
                WHERE h.ownerId = ? AND tgm.userId = ?
            `;
            params = [orgRows[0].ownerId, req.user.id];
        } else {
            query = "SELECT id, name, host as ip, user, isShared, ownerId, port FROM hosts WHERE ownerId = ?";
            params = [req.user.id];
        }

        const [rows] = await db.query(query, params);
        
        // Map to UI specific fields without passing raw credentials
        const formattedHosts = rows.map(r => ({
            id: r.id,
            name: r.name || r.ip || r.id,
            ip: r.ip,
            user: r.user,
            type: r.isShared ? 'shared' : 'personal',
            status: 'online', // Status typically needs an active ping system or fetching from active_sessions, defaulting to 'online' for UI display
            os: 'linux' // Default since OS is not strictly stored in DB currently
        }));

        res.json(formattedHosts);
    } catch (err) {
        console.error("Client hosts error:", err);
        res.status(500).json({ error: "Internal Error" });
    }
});

const crypto = require("crypto");

router.post("/", auth, async (req, res) => {
    const { name, ip, user, port, isShared } = req.body;
    
    let ownerId = req.user.id;
    if (req.user.role === 'team_mate' && req.user.organizationId) {
        if (!req.user.permissions?.createHost) return res.status(403).json({error: "Forbidden"});
        const [orgRows] = await db.query("SELECT ownerId FROM organizations WHERE id = ?", [req.user.organizationId]);
        if (orgRows.length) ownerId = orgRows[0].ownerId;
    }

    try {
        const id = crypto.randomUUID();
        await db.query(
            "INSERT INTO hosts (id, name, host, user, port, isShared, ownerId) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [id, name, ip, user, parseInt(port)||22, isShared ? 1 : 0, ownerId]
        );
        res.json({ success: true, id });
    } catch (err) {
        console.error("Create host error:", err);
        res.status(500).json({ error: "Internal Error" });
    }
});

module.exports = router;
