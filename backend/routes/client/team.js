const express = require("express");
const db = require("../../db");
const auth = require("../../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    try {
        if (!req.user.organizationId) {
             return res.json([]);
        }
        const [rows] = await db.query("SELECT id, username, role, permissions, isActive FROM users WHERE organizationId = ?", [req.user.organizationId]);
        
        const uiMapped = rows.map(r => {
            let uiRole = 'Member';
            if (r.role === 'organization_user' || r.role === 'owner') uiRole = 'Admin';
            
            return {
                id: r.id,
                name: r.username,
                email: r.username, // Using username as email fallback for visual parity
                role: uiRole,
                status: r.isActive === null || r.isActive === 1 ? 'Active' : 'Inactive',
                permissions: r.permissions || {
                    createHost: uiRole === 'Admin',
                    editShared: uiRole === 'Admin',
                    viewLogs: uiRole === 'Admin',
                    startSessions: true
                }
            };
        });

        res.json(uiMapped);
    } catch (err) {
        console.error("Client team error:", err);
        res.status(500).json({ error: "Internal Error" });
    }
});

const crypto = require("crypto");
const bcrypt = require("bcrypt");

// Invite a teammate logic
router.post("/", auth, async (req, res) => {
    // Only organization_user should be able to create team_mates
    if (req.user.role !== 'organization_user' || !req.user.organizationId) {
        return res.status(403).json({ error: "Forbidden: Only Organization accounts can invite members." });
    }

    const { email } = req.body;
    try {
        const id = crypto.randomUUID();
        const tempPassword = crypto.randomBytes(8).toString('hex');
        const hash = await bcrypt.hash(tempPassword, 10);
        
        const defaultTeamPerms = JSON.stringify({ createHost: false, editShared: false, viewLogs: false, startSessions: true });
        
        await db.query(
            "INSERT INTO users (id, username, password, role, organizationId, permissions) VALUES (?, ?, ?, ?, ?, ?)",
            [id, email, hash, 'team_mate', req.user.organizationId, defaultTeamPerms]
        );

        res.json({ message: "Teammate created successfully", tempPassword });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ error: "Username already exists" });
        }
        res.status(500).json({ error: "Internal error creating teammate" });
    }
});

// Update a teammate's permissions
router.put("/:id/permissions", auth, async (req, res) => {
    if (req.user.role !== 'organization_user' || !req.user.organizationId) {
        return res.status(403).json({ error: "Forbidden: Only Organization accounts can edit permissions." });
    }

    try {
        await db.query(
            "UPDATE users SET permissions = ? WHERE id = ? AND organizationId = ?",
            [JSON.stringify(req.body.permissions), req.params.id, req.user.organizationId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Permission update error:", err);
        res.status(500).json({ error: "Internal error updating permissions" });
    }
});

// Toggle teammate active status
router.put("/:id/status", auth, async (req, res) => {
    if (req.user.role !== 'organization_user' || !req.user.organizationId) {
        return res.status(403).json({ error: "Forbidden" });
    }
    try {
        const { isActive } = req.body;
        await db.query(
            "UPDATE users SET isActive = ? WHERE id = ? AND organizationId = ?",
            [isActive ? 1 : 0, req.params.id, req.user.organizationId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Internal error" });
    }
});

// Delete teammate
router.delete("/:id", auth, async (req, res) => {
    if (req.user.role !== 'organization_user' || !req.user.organizationId) {
        return res.status(403).json({ error: "Forbidden" });
    }
    try {
        await db.query(
            "DELETE FROM users WHERE id = ? AND organizationId = ?",
            [req.params.id, req.user.organizationId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Internal error" });
    }
});

module.exports = router;
