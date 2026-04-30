const db = require("../db");

const HostModel = {
    getHostsForOwner: async (ownerId) => {
        const [rows] = await db.query(
            "SELECT * FROM hosts WHERE ownerId = ?",
            [ownerId]
        );
        return rows;
    },

    getHostsForTeammate: async (ownerId, userId) => {
        const [rows] = await db.query(`
            SELECT DISTINCT h.*
            FROM hosts h
            JOIN team_group_hosts tgh ON h.id = tgh.hostId
            JOIN team_group_members tgm ON tgh.groupId = tgm.groupId
            WHERE h.ownerId = ? AND tgm.userId = ?
        `, [ownerId, userId]);
        return rows;
    },

    getClientHosts: async (userId, userRole, orgOwnerId) => {
        if (userRole === 'team_mate' && orgOwnerId) {
            const [rows] = await db.query(`
                SELECT DISTINCT h.id, h.name, h.host as ip, h.user, h.isShared, h.ownerId, h.port 
                FROM hosts h
                JOIN team_group_hosts tgh ON h.id = tgh.hostId
                JOIN team_group_members tgm ON tgh.groupId = tgm.groupId
                WHERE h.ownerId = ? AND tgm.userId = ?
            `, [orgOwnerId, userId]);
            return rows;
        } else {
            const [rows] = await db.query("SELECT id, name, host as ip, user, isShared, ownerId, port FROM hosts WHERE ownerId = ?", [userId]);
            return rows;
        }
    },

    getJumpHostDetails: async (jumpHostId) => {
        const [rows] = await db.query(
            "SELECT id, name, host, user FROM hosts WHERE id = ?",
            [jumpHostId]
        );
        return rows[0];
    },

    createHost: async (id, name, host, port, user, authType, passwordEnc, sshKeyEnc, passphraseEnc, identityFile, identitiesOnly, proxyCommand, proxyJump, group, description, ownerId, isShared, jumpHostId) => {
        await db.query(
            `INSERT INTO hosts
             (id, name, host, port, user, authType,
              passwordEnc, sshKeyEnc, passphraseEnc,
              identityFile, identitiesOnly, proxyCommand, proxyJump, \`group\`,
              description, ownerId, isShared, jumpHostId)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, name, host, port, user, authType,
                passwordEnc, sshKeyEnc, passphraseEnc,
                identityFile, identitiesOnly, proxyCommand, proxyJump, group,
                description, ownerId, isShared, jumpHostId
            ]
        );
    },

    updateHost: async (id, ownerId, name, host, port, user, authType, passwordEnc, sshKeyEnc, passphraseEnc, identityFile, identitiesOnly, proxyCommand, proxyJump, group, description, isShared, jumpHostId) => {
        const [result] = await db.query(
            `UPDATE hosts SET
                name=?, host=?, port=?, user=?, authType=?,
                passwordEnc=?, sshKeyEnc=?, passphraseEnc=?,
                identityFile=?, identitiesOnly=?, proxyCommand=?, proxyJump=?,
                \`group\`=?, description=?, isShared=?, jumpHostId=?
             WHERE id=? AND ownerId=?`,
            [
                name, host, port, user, authType,
                passwordEnc, sshKeyEnc, passphraseEnc,
                identityFile, identitiesOnly, proxyCommand, proxyJump,
                group, description, isShared, jumpHostId, id, ownerId
            ]
        );
        return result.affectedRows;
    },

    deleteHost: async (id, ownerId) => {
        const [result] = await db.query(
            "DELETE FROM hosts WHERE id = ? AND ownerId = ?",
            [id, ownerId]
        );
        return result.affectedRows;
    }
};

module.exports = HostModel;
