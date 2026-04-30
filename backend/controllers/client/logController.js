const LogModel = require("../../models/logModel");

const parseDetails = (rows) => {
    return rows.map(r => {
        let parsedDetails = r.details;
        try { if(r.details) parsedDetails = JSON.parse(r.details); } catch(e){}
        return {
            ...r,
            details: parsedDetails
        };
    });
};

const ClientLogController = {
    getLogs: async (req, res) => {
        try {
            const userRole = req.user.role;
            const userId = req.user.id;
            const organizationId = req.user.organizationId;

            const rows = await LogModel.getClientLogs(userRole, userId, organizationId);
            const parsedRows = parseDetails(rows);

            res.json(parsedRows);
        } catch (err) {
            console.error("Client logs error:", err);
            res.status(500).json({ error: "Internal Error" });
        }
    },

    getSessionLogs: async (req, res) => {
        try {
            const { sessionId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = 30;
            const offset = (page - 1) * limit;
            
            const userRole = req.user.role;
            const userId = req.user.id;
            const organizationId = req.user.organizationId;
            const search = req.query.search;

            const { rows, total } = await LogModel.getClientLogsBySession(
                sessionId, search, userRole, userId, organizationId, limit, offset
            );
            
            const parsedRows = parseDetails(rows);

            res.json({
                data: parsedRows,
                meta: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (err) {
            console.error("Session logs fetch error:", err);
            res.status(500).json({ error: "Internal Error" });
        }
    }
};

module.exports = ClientLogController;
