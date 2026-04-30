const crypto = require("crypto");
const TeamGroupModel = require("../../models/teamGroupModel");

const ClientTeamGroupController = {
    getGroups: async (req, res) => {
        if (!req.user.organizationId) return res.json([]);

        try {
            const groups = await TeamGroupModel.getTeamGroups(req.user.organizationId);

            for (let group of groups) {
                group.members = await TeamGroupModel.getGroupMembers(group.id);
                group.hosts = await TeamGroupModel.getGroupHosts(group.id);
            }

            res.json(groups);
        } catch (err) {
            console.error("Fetch team_groups error:", err);
            res.status(500).json({ error: "Internal Error" });
        }
    },

    createGroup: async (req, res) => {
        if (req.user.role !== 'organization_user' || !req.user.organizationId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const { name, members, hosts } = req.body;
        if (!name) return res.status(400).json({ error: "Name required" });

        try {
            const id = crypto.randomUUID();
            await TeamGroupModel.createGroup(id, name, req.user.organizationId);

            if (Array.isArray(members) && members.length > 0) {
                const memberValues = members.map(userId => [id, userId]);
                await TeamGroupModel.addMembersToGroup(memberValues);
            }

            if (Array.isArray(hosts) && hosts.length > 0) {
                const hostValues = hosts.map(hostId => [id, hostId]);
                await TeamGroupModel.addHostsToGroup(hostValues);
            }

            res.json({ success: true, id });
        } catch (err) {
            console.error("Create team_groups error:", err);
            res.status(500).json({ error: "Internal Error" });
        }
    },

    updateGroup: async (req, res) => {
        if (req.user.role !== 'organization_user' || !req.user.organizationId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const { name, members, hosts } = req.body;
        const groupId = req.params.id;

        try {
            const affectedRows = await TeamGroupModel.updateGroup(groupId, name, req.user.organizationId);

            if (affectedRows === 0) {
                return res.status(404).json({ error: "Group not found or unauthorized" });
            }

            await TeamGroupModel.deleteGroupMembers(groupId);
            if (Array.isArray(members) && members.length > 0) {
                const memberValues = members.map(userId => [groupId, userId]);
                await TeamGroupModel.addMembersToGroup(memberValues);
            }

            await TeamGroupModel.deleteGroupHosts(groupId);
            if (Array.isArray(hosts) && hosts.length > 0) {
                const hostValues = hosts.map(hostId => [groupId, hostId]);
                await TeamGroupModel.addHostsToGroup(hostValues);
            }

            res.json({ success: true });
        } catch (err) {
            console.error("Update team_groups error:", err);
            res.status(500).json({ error: "Internal Error" });
        }
    },

    deleteGroup: async (req, res) => {
        if (req.user.role !== 'organization_user' || !req.user.organizationId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        try {
            const affectedRows = await TeamGroupModel.deleteGroup(req.params.id, req.user.organizationId);
            
            if (affectedRows === 0) {
                return res.status(404).json({ error: "Group not found or unauthorized" });
            }

            await TeamGroupModel.deleteGroupMembers(req.params.id);
            await TeamGroupModel.deleteGroupHosts(req.params.id);

            res.json({ success: true });
        } catch (err) {
            console.error("Delete team_groups error:", err);
            res.status(500).json({ error: "Internal Error" });
        }
    }
};

module.exports = ClientTeamGroupController;
