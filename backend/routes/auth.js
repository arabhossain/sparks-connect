const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../db");
require("dotenv").config();

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        const id = crypto.randomUUID();
        const hash = await bcrypt.hash(password, 10);

        await db.query(
            "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
            [id, username, hash]
        );

        res.json({ id, username });
    } catch (err) {
        res.status(400).json(err);
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE username = ?",
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

        if (!user.isActive) {
            return res.status(403).json({ error: "Account deactivated" });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        let organizationName = null;
        if (user.organizationId) {
            const [orgRows] = await db.query("SELECT name FROM organizations WHERE id = ?", [user.organizationId]);
            if (orgRows.length > 0) {
                organizationName = orgRows[0].name;
            }
        } else if (user.role === 'owner') {
            const [orgRows] = await db.query("SELECT name FROM organizations WHERE ownerId = ?", [user.id]);
            if (orgRows.length > 0) {
                organizationName = orgRows[0].name;
            }
        }

        res.json({ 
            token, 
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                organizationName: organizationName,
                permissions: user.permissions
            }
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// CHANGE PASSWORD
const auth = require("../middleware/auth");
router.post("/change-password", auth, async (req, res) => {
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

module.exports = router;