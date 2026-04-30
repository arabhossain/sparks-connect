const db = require("../db");

const TeamGroupModel = {
    getTeamGroups: async (organizationId) => {
        const [groups] = await db.query(
            "SELECT * FROM team_groups WHERE organizationId = ?",
            [organizationId]
        );
        return groups;
    },
    getGroupMembers: async (groupId) => {
        const [members] = await db.query("SELECT userId as id FROM team_group_members WHERE groupId = ?", [groupId]);
        return members.map(m => m.id);
    },
    getGroupHosts: async (groupId) => {
        const [hosts] = await db.query("SELECT hostId as id FROM team_group_hosts WHERE groupId = ?", [groupId]);
        return hosts.map(h => h.id);
    },
    createGroup: async (id, name, organizationId) => {
        await db.query("INSERT INTO team_groups (id, name, organizationId) VALUES (?, ?, ?)", [id, name, organizationId]);
    },
    addMembersToGroup: async (memberValues) => {
        if(memberValues.length) await db.query("INSERT INTO team_group_members (groupId, userId) VALUES ?", [memberValues]);
    },
    addHostsToGroup: async (hostValues) => {
        if(hostValues.length) await db.query("INSERT INTO team_group_hosts (groupId, hostId) VALUES ?", [hostValues]);
    },
    updateGroup: async (id, name, organizationId) => {
        const [result] = await db.query("UPDATE team_groups SET name = ? WHERE id = ? AND organizationId = ?", [name, id, organizationId]);
        return result.affectedRows;
    },
    deleteGroupMembers: async (groupId) => {
        await db.query("DELETE FROM team_group_members WHERE groupId = ?", [groupId]);
    },
    deleteGroupHosts: async (groupId) => {
        await db.query("DELETE FROM team_group_hosts WHERE groupId = ?", [groupId]);
    },
    deleteGroup: async (id, organizationId) => {
        const [result] = await db.query("DELETE FROM team_groups WHERE id = ? AND organizationId = ?", [id, organizationId]);
        return result.affectedRows;
    }
};

module.exports = TeamGroupModel;
