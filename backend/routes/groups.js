const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * GET ALL GROUPS
 */
router.get("/", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const [groups] = await db.query(
            "SELECT * FROM groups WHERE ownerId = ?",
            [userId]
        );
        res.json(groups);
    } catch (err) {
        res.status(500).json(err);
    }
});

/**
 * CREATE GROUP
 */
router.post("/", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;
        const id = crypto.randomUUID();

        await db.query(
            "INSERT INTO groups (id, name, ownerId) VALUES (?, ?, ?)",
            [id, name, userId]
        );

        res.json({ id, name });
    } catch (err) {
        res.status(500).json(err);
    }
});

/**
 * DELETE GROUP
 */
router.delete("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM groups WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
