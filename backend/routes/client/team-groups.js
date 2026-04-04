const express = require("express");
const crypto = require("crypto");
const db = require("../../db");
const auth = require("../../middleware/auth");

const router = express.Router();

// GET all groups and their members/hosts
router.get("/", auth, async (req, res) => {
    if (!req.user.organizationId) return res.json([]);

    try {
        const [groups] = await db.query(
            "SELECT * FROM team_groups WHERE organizationId = ?",
            [req.user.organizationId]
        );

        for (let group of groups) {
            const [members] = await db.query(
                "SELECT userId as id FROM team_group_members WHERE groupId = ?",
                [group.id]
            );
            group.members = members.map(m => m.id);

            const [hosts] = await db.query(
                "SELECT hostId as id FROM team_group_hosts WHERE groupId = ?",
                [group.id]
            );
            group.hosts = hosts.map(h => h.id);
        }

        res.json(groups);
    } catch (err) {
        console.error("Fetch team_groups error:", err);
        res.status(500).json({ error: "Internal Error" });
    }
});

// CREATE group
router.post("/", auth, async (req, res) => {
    if (req.user.role !== 'organization_user' || !req.user.organizationId) {
        return res.status(403).json({ error: "Forbidden" });
    }

    const { name, members, hosts } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });

    try {
        const id = crypto.randomUUID();
        await db.query(
            "INSERT INTO team_groups (id, name, organizationId) VALUES (?, ?, ?)",
            [id, name, req.user.organizationId]
        );

        if (Array.isArray(members) && members.length > 0) {
            const memberValues = members.map(userId => [id, userId]);
            await db.query("INSERT INTO team_group_members (groupId, userId) VALUES ?", [memberValues]);
        }

        if (Array.isArray(hosts) && hosts.length > 0) {
            const hostValues = hosts.map(hostId => [id, hostId]);
            await db.query("INSERT INTO team_group_hosts (groupId, hostId) VALUES ?", [hostValues]);
        }

        res.json({ success: true, id });
    } catch (err) {
        console.error("Create team_groups error:", err);
        res.status(500).json({ error: "Internal Error" });
    }
});

// UPDATE group members and hosts
router.put("/:id", auth, async (req, res) => {
    if (req.user.role !== 'organization_user' || !req.user.organizationId) {
        return res.status(403).json({ error: "Forbidden" });
    }

    const { name, members, hosts } = req.body;
    const groupId = req.params.id;

    try {
        await db.query(
            "UPDATE team_groups SET name = ? WHERE id = ? AND organizationId = ?",
            [name, groupId, req.user.organizationId]
        );

        await db.query("DELETE FROM team_group_members WHERE groupId = ?", [groupId]);
        if (Array.isArray(members) && members.length > 0) {
            const memberValues = members.map(userId => [groupId, userId]);
            await db.query("INSERT INTO team_group_members (groupId, userId) VALUES ?", [memberValues]);
        }

        await db.query("DELETE FROM team_group_hosts WHERE groupId = ?", [groupId]);
        if (Array.isArray(hosts) && hosts.length > 0) {
            const hostValues = hosts.map(hostId => [groupId, hostId]);
            await db.query("INSERT INTO team_group_hosts (groupId, hostId) VALUES ?", [hostValues]);
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Update team_groups error:", err);
        res.status(500).json({ error: "Internal Error" });
    }
});

// DELETE group
router.delete("/:id", auth, async (req, res) => {
    if (req.user.role !== 'organization_user' || !req.user.organizationId) {
        return res.status(403).json({ error: "Forbidden" });
    }

    try {
        await db.query(
            "DELETE FROM team_groups WHERE id = ? AND organizationId = ?",
            [req.params.id, req.user.organizationId]
        );
        // Cascading deletes manually since we didn't add ON DELETE CASCADE
        await db.query("DELETE FROM team_group_members WHERE groupId = ?", [req.params.id]);
        await db.query("DELETE FROM team_group_hosts WHERE groupId = ?", [req.params.id]);

        res.json({ success: true });
    } catch (err) {
        console.error("Delete team_groups error:", err);
        res.status(500).json({ error: "Internal Error" });
    }
});

module.exports = router;
