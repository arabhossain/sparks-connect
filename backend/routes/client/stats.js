const express = require("express");
const db = require("../../db");
const auth = require("../../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    try {
        const userRole = req.user.role;
        const orgId = req.user.organizationId;
        const userId = req.user.id;

        let totalHosts = 0;
        let activeSessions = 0;
        let teamMembers = 0;

        if (userRole === 'organization_user' && orgId) {
            const [[hostsRes]] = await db.query("SELECT COUNT(*) as c FROM hosts WHERE ownerId IN (SELECT ownerId FROM organizations WHERE id = ?)", [orgId]);
            totalHosts = hostsRes.c;

            const [[sessionsRes]] = await db.query("SELECT COUNT(*) as c FROM active_sessions WHERE status = 'active'");
            activeSessions = sessionsRes.c;

            const [[teamRes]] = await db.query("SELECT COUNT(*) as c FROM users WHERE organizationId = ?", [orgId]);
            teamMembers = teamRes.c;
        } else if (userRole === 'team_mate' && orgId) {
            const [[hostsRes]] = await db.query(`
                SELECT COUNT(DISTINCT h.id) as c 
                FROM hosts h
                JOIN team_group_hosts tgh ON h.id = tgh.hostId
                JOIN team_group_members tgm ON tgh.groupId = tgm.groupId
                WHERE tgm.userId = ?
            `, [userId]);
            totalHosts = hostsRes.c;

            const [[sessionsRes]] = await db.query("SELECT COUNT(*) as c FROM active_sessions WHERE status = 'active' AND userId = ?", [userId]);
            activeSessions = sessionsRes.c;
            teamMembers = -1;
        } else {
            const [[hostsRes]] = await db.query("SELECT COUNT(*) as c FROM hosts WHERE ownerId = ?", [userId]);
            totalHosts = hostsRes.c;

            const [[sessionsRes]] = await db.query("SELECT COUNT(*) as c FROM active_sessions WHERE status = 'active' AND userId = ?", [userId]);
            activeSessions = sessionsRes.c;
            teamMembers = -1;
        }

        res.json({
            totalHosts,
            activeSessions,
            teamMembers
        });
    } catch (err) {
        console.error("Stats error:", err);
        res.status(500).json({ error: "Internal Error" });
    }
});

module.exports = router;
