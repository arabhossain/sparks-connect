const db = require("../db");

const StatsModel = {
    getOrgHostCount: async (orgId) => {
        const [[hostsRes]] = await db.query("SELECT COUNT(*) as c FROM hosts WHERE ownerId IN (SELECT ownerId FROM organizations WHERE id = ?)", [orgId]);
        return hostsRes.c;
    },
    getActiveSessionCount: async () => {
        const [[sessionsRes]] = await db.query("SELECT COUNT(*) as c FROM active_sessions WHERE status = 'active'");
        return sessionsRes.c;
    },
    getOrgTeamMemberCount: async (orgId) => {
        const [[teamRes]] = await db.query("SELECT COUNT(*) as c FROM users WHERE organizationId = ?", [orgId]);
        return teamRes.c;
    },
    getTeammateHostCount: async (userId) => {
        const [[hostsRes]] = await db.query(`
            SELECT COUNT(DISTINCT h.id) as c 
            FROM hosts h
            JOIN team_group_hosts tgh ON h.id = tgh.hostId
            JOIN team_group_members tgm ON tgh.groupId = tgm.groupId
            WHERE tgm.userId = ?
        `, [userId]);
        return hostsRes.c;
    },
    getUserActiveSessionCount: async (userId) => {
        const [[sessionsRes]] = await db.query("SELECT COUNT(*) as c FROM active_sessions WHERE status = 'active' AND userId = ?", [userId]);
        return sessionsRes.c;
    },
    getOwnerHostCount: async (userId) => {
        const [[hostsRes]] = await db.query("SELECT COUNT(*) as c FROM hosts WHERE ownerId = ?", [userId]);
        return hostsRes.c;
    }
};

module.exports = StatsModel;
