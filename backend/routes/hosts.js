const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const auth = require("../middleware/auth");
const { encrypt, decrypt } = require("../utils/crypto");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const [hosts] = await db.query(
            "SELECT * FROM hosts WHERE ownerId = ? OR isShared = 1",
            [userId]
        );

        const result = [];

        for (const host of hosts) {
            const [tags] = await db.query(
                `SELECT t.name FROM tags t
                                        JOIN host_tags ht ON t.id = ht.tagId
                 WHERE ht.hostId = ?`,
                [host.id]
            );

            let jumpHost = null;
            if (host.jumpHostId) {
                const [jump] = await db.query(
                    "SELECT id, name, host, user FROM hosts WHERE id = ?",
                    [host.jumpHostId]
                );
                if (jump.length) jumpHost = jump[0];
            }

            result.push({
                ...host,
                password: host.passwordEnc ? decrypt(host.passwordEnc) : null,
                sshKey: host.sshKeyEnc ? decrypt(host.sshKeyEnc) : null,
                passphrase: host.passphraseEnc ? decrypt(host.passphraseEnc) : null,
                tags: tags.map(t => t.name),
                jumpHost
            });
        }

        res.json(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post("/", auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            name,
            host,
            user,
            authType,
            password,
            sshKey,
            passphrase,
            description,
            tags = [],
            isShared = false,
            jumpHostId = null
        } = req.body;

        const id = crypto.randomUUID();

        await db.query(
            `INSERT INTO hosts
             (id, name, host, user, authType, passwordEnc, sshKeyEnc, passphraseEnc, description, ownerId, isShared, jumpHostId)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                name,
                host,
                user,
                authType,
                password ? encrypt(password) : null,
                sshKey ? encrypt(sshKey) : null,
                passphrase ? encrypt(passphrase) : null,
                description,
                userId,
                isShared ? 1 : 0,
                jumpHostId || null
            ]
        );

        for (const tag of tags) {
            const tagId = crypto.randomUUID();

            await db.query(
                "INSERT IGNORE INTO tags (id, name) VALUES (?, ?)",
                [tagId, tag]
            );

            const [t] = await db.query(
                "SELECT id FROM tags WHERE name = ?",
                [tag]
            );

            if (t.length) {
                await db.query(
                    "INSERT INTO host_tags (hostId, tagId) VALUES (?, ?)",
                    [id, t[0].id]
                );
            }
        }

        res.json({ id });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.put("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            host,
            user,
            authType,
            password,
            sshKey,
            passphrase,
            description,
            isShared,
            jumpHostId = null
        } = req.body;

        await db.query(
            `UPDATE hosts SET
                              name=?,
                              host=?,
                              user=?,
                              authType=?,
                              passwordEnc=?,
                              sshKeyEnc=?,
                              passphraseEnc=?,
                              description=?,
                              isShared=?,
                              jumpHostId=?
             WHERE id=?`,
            [
                name,
                host,
                user,
                authType,
                password ? encrypt(password) : null,
                sshKey ? encrypt(sshKey) : null,
                passphrase ? encrypt(passphrase) : null,
                description,
                isShared ? 1 : 0,
                jumpHostId || null,
                id
            ]
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.delete("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM hosts WHERE id = ?",
            [id]
        );

        // 🔍 Check if anything was deleted
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Host not found"
            });
        }

        return res.json({
            success: true,
            message: "Host deleted successfully"
        });

    } catch (err) {
        console.error("Delete host error:", err);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

module.exports = router;