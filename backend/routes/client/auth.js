const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../db");
require("dotenv").config();

const crypto = require("crypto");
const router = express.Router();

// Web UI Register
router.post("/register", async (req, res) => {
    const { username, password, role, orgName } = req.body;

    try {
        const id = crypto.randomUUID();
        const hash = await bcrypt.hash(password, 10);
        const assignedRole = role || "team_mate";
        let assignedOrgId = null;

        if (assignedRole === "organization_user" && orgName) {
            assignedOrgId = crypto.randomUUID();
            await db.query(
                "INSERT INTO organizations (id, name, ownerId) VALUES (?, ?, ?)",
                [assignedOrgId, orgName, id]
            );
        }

        const defaultOrgPerms = JSON.stringify({ createHost: true, editShared: true, viewLogs: true, startSessions: true });
        const defaultTeamPerms = JSON.stringify({ createHost: false, editShared: false, viewLogs: false, startSessions: true });
        const permsJSON = assignedRole === "organization_user" ? defaultOrgPerms : defaultTeamPerms;

        await db.query(
            "INSERT INTO users (id, username, password, role, organizationId, permissions) VALUES (?, ?, ?, ?, ?, ?)",
            [id, username, hash, assignedRole, assignedOrgId, permsJSON]
        );

        const permsObj = JSON.parse(permsJSON);

        const token = jwt.sign(
            { id, username, role: assignedRole, organizationId: assignedOrgId, permissions: permsObj },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token, user: { id, username, role: assignedRole, organizationId: assignedOrgId, permissions: permsObj } });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
             return res.status(400).json({ error: "Username already exists" });
        }
        console.error("Client register error:", err);
        res.status(500).json({ error: "Internal Error" });
    }
});

// Web UI Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.query(
            "SELECT id, username, password, role, organizationId, permissions, isActive FROM users WHERE username = ?",
            [username]
        );

        if (!rows.length) {
            return res.status(401).json({ error: "User not found" });
        }

        const user = rows[0];

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(403).json({ error: "Invalid password" });
        }
        
        if (user.isActive === 0) {
            return res.status(403).json({ error: "Account deactivated" });
        }

        let organizationName = null;
        if (user.organizationId) {
            const [orgRows] = await db.query("SELECT name FROM organizations WHERE id = ?", [user.organizationId]);
            if (orgRows.length > 0) organizationName = orgRows[0].name;
        } else if (user.role === 'owner') {
            const [orgRows] = await db.query("SELECT name FROM organizations WHERE ownerId = ?", [user.id]);
            if (orgRows.length > 0) organizationName = orgRows[0].name;
        }

        const permsObj = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || { createHost: false, editShared: false, viewLogs: false, startSessions: true });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, organizationId: user.organizationId, permissions: permsObj },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token, user: { id: user.id, username: user.username, role: user.role, organizationId: user.organizationId, organizationName, permissions: permsObj } });
    } catch (err) {
        console.error("Client login error:", err);
        res.status(500).json({ error: "Internal Error" });
    }
});

// Web UI CHANGE PASSWORD
const authenticate = require("../../middleware/auth");
router.post("/change-password", authenticate, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
        if (!rows.length) return res.status(404).json({ error: "User not found" });

        const user = rows[0];
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) {
            return res.status(400).json({ error: "Invalid current password" });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE users SET password = ? WHERE id = ?", [hash, req.user.id]);
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Internal Error" });
    }
});

// Web UI UPDATE ORGANIZATION
router.put("/organization", authenticate, async (req, res) => {
    const { name } = req.body;
    if (req.user.role !== 'organization_user') {
        return res.status(403).json({ error: "Forbidden: Only organization owners can change the organization name" });
    }
    try {
        await db.query("UPDATE organizations SET name = ? WHERE ownerId = ?", [name, req.user.id]);
        res.json({ success: true, name });
    } catch (err) {
        console.error("Update organization error:", err);
        res.status(500).json({ error: "Internal Error" });
    }
});

module.exports = router;
