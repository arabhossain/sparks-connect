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

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;