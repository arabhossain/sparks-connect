const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM tags");
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;