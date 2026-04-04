const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const auth = require("../middleware/auth");
const { encrypt, decrypt } = require("../utils/crypto");

const router = express.Router();

/**
 * =========================
 * GET HOSTS
 * =========================
 */
router.get("/", auth, async (req, res) => {
    try {
        let hosts = [];

        if (req.user.role === 'team_mate' && req.user.organizationId) {
            const [orgRows] = await db.query("SELECT ownerId FROM organizations WHERE id = ?", [req.user.organizationId]);
            if (orgRows.length > 0) {
                const [rows] = await db.query(`
                    SELECT DISTINCT h.*
                    FROM hosts h
                    JOIN team_group_hosts tgh ON h.id = tgh.hostId
                    JOIN team_group_members tgm ON tgh.groupId = tgm.groupId
                    WHERE h.ownerId = ? AND tgm.userId = ?
                `, [orgRows[0].ownerId, req.user.id]);
                hosts = rows;
            }
        } else {
            const [rows] = await db.query(
                "SELECT * FROM hosts WHERE ownerId = ?",
                [req.user.id]
            );
            hosts = rows;
        }

        const result = [];

        for (const host of hosts) {
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

                // 🔐 decrypt sensitive
                password: host.passwordEnc ? decrypt(host.passwordEnc) : null,
                sshKey: host.sshKeyEnc ? decrypt(host.sshKeyEnc) : null,
                passphrase: host.passphraseEnc ? decrypt(host.passphraseEnc) : null,

                // 🔗 jump host object
                jumpHost,

                // ✅ normalize booleans
                identitiesOnly: !!host.identitiesOnly,
                isShared: !!host.isShared,
            });
        }

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

/**
 * =========================
 * CREATE HOST
 * =========================
 */
router.post("/", auth, async (req, res) => {
    try {
        let finalOwnerId = req.user.id;

        if (req.user.role === 'team_mate' && req.user.organizationId) {
            if (!req.user.permissions?.createHost) {
                return res.status(403).json({ error: "Forbidden: You don't have permission to create hosts." });
            }
            const [orgRows] = await db.query("SELECT ownerId FROM organizations WHERE id = ?", [req.user.organizationId]);
            if (orgRows.length > 0) {
                finalOwnerId = orgRows[0].ownerId;
            }
        }

        const {
            name,
            host,
            port = 22,
            user,

            authType,
            password,
            sshKey,
            passphrase,

            // 🔥 NEW FIELDS
            identityFile,
            identitiesOnly = false,
            proxyCommand,
            proxyJump,

            group,
            description,
            isShared = false,
            jumpHostId = null
        } = req.body;

        const id = crypto.randomUUID();

        await db.query(
            `INSERT INTO hosts
             (id, name, host, port, user, authType,
              passwordEnc, sshKeyEnc, passphraseEnc,
              identityFile, identitiesOnly, proxyCommand, proxyJump, \`group\`,
              description, ownerId, isShared, jumpHostId)

             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                name,
                host,
                port,
                user,
                authType,

                password ? encrypt(password) : null,
                sshKey ? encrypt(sshKey) : null,
                passphrase ? encrypt(passphrase) : null,

                identityFile || null,
                identitiesOnly ? 1 : 0,
                proxyCommand || null,
                proxyJump || null,
                group || null,
                description,
                finalOwnerId,
                isShared ? 1 : 0,
                jumpHostId || null
            ]
        );

        res.json({ id });

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

/**
 * =========================
 * UPDATE HOST
 * =========================
 */
router.put("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            host,
            port = 22,
            user,

            authType,
            password,
            sshKey,
            passphrase,

            // 🔥 NEW FIELDS
            identityFile,
            identitiesOnly,
            proxyCommand,
            proxyJump,

            group,
            description,
            isShared,
            jumpHostId = null
        } = req.body;

        await db.query(
            `UPDATE hosts SET
                              name=?,
                              host=?,
                              port=?,
                              user=?,
                              authType=?,
                              passwordEnc=?,
                              sshKeyEnc=?,
                              passphraseEnc=?,
                              identityFile=?,
                              identitiesOnly=?,
                              proxyCommand=?,
                              proxyJump=?,
                              \`group\`=?,
                              description=?,
                              isShared=?,
                              jumpHostId=?
             WHERE id=?`,
            [
                name,
                host,
                port,
                user,
                authType,

                password ? encrypt(password) : null,
                sshKey ? encrypt(sshKey) : null,
                passphrase ? encrypt(passphrase) : null,

                identityFile || null,
                identitiesOnly ? 1 : 0,
                proxyCommand || null,
                proxyJump || null,
                group || null,
                description,
                isShared ? 1 : 0,
                jumpHostId || null,

                id
            ]
        );

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

/**
 * =========================
 * DELETE HOST
 * =========================
 */
router.delete("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM hosts WHERE id = ?",
            [id]
        );

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