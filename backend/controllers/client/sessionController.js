const SessionModel = require("../../models/sessionModel");

const ClientSessionController = {
    getSessions: async (req, res) => {
        try {
            const userRole = req.user.role;
            const userId = req.user.id;
            const organizationId = req.user.organizationId;
            const status = req.query.status;

            const rows = await SessionModel.getClientSessions(userRole, userId, organizationId, status);
            res.json(rows);
        } catch (err) {
            console.error("Client sessions error:", err);
            res.status(500).json({ error: "Internal Error" });
        }
    }
};

module.exports = ClientSessionController;
