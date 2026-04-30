const StatsModel = require("../../models/statsModel");

const ClientStatsController = {
    getStats: async (req, res) => {
        try {
            const userRole = req.user.role;
            const orgId = req.user.organizationId;
            const userId = req.user.id;

            let totalHosts = 0;
            let activeSessions = 0;
            let teamMembers = 0;

            if (userRole === 'organization_user' && orgId) {
                totalHosts = await StatsModel.getOrgHostCount(orgId);
                activeSessions = await StatsModel.getOrgActiveSessionCount(orgId);
                teamMembers = await StatsModel.getOrgTeamMemberCount(orgId);
            } else if (userRole === 'team_mate' && orgId) {
                totalHosts = await StatsModel.getTeammateHostCount(userId);
                activeSessions = await StatsModel.getUserActiveSessionCount(userId);
                teamMembers = -1;
            } else {
                totalHosts = await StatsModel.getOwnerHostCount(userId);
                activeSessions = await StatsModel.getUserActiveSessionCount(userId);
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
    }
};

module.exports = ClientStatsController;
