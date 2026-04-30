const crypto = require("crypto");
const SessionModel = require("../models/sessionModel");
const LogModel = require("../models/logModel");
const UserModel = require("../models/userModel");

const TelemetryController = {
    postSession: async (req, res) => {
        const { hostId, status } = req.body;
        const userId = req.user.id;

        try {
            const existing = await SessionModel.getActiveSession(userId, hostId);

            if (existing) {
                await SessionModel.updateSessionHeartbeat(existing.id, status);
                return res.json({ id: existing.id, session: 'updated' });
            } else {
                const sessionId = crypto.randomUUID();
                await SessionModel.createSession(sessionId, userId, hostId, status);
                return res.json({ id: sessionId, session: 'created' });
            }
        } catch (err) {
            console.error("Session telemetry error:", err);
            return res.status(500).json({ error: "Internal Error" });
        }
    },

    postLog: async (req, res) => {
        const { action, details, sessionId } = req.body;
        const userId = req.user.id;

        try {
            const user = await UserModel.getUserById(userId);
            if (!user) return res.status(401).json({ error: "User not found" });
            
            if (!user.track_activity) {
                 return res.json({ status: 'ignored', reason: 'tracking_disabled' });
            }

            const logId = crypto.randomUUID();
            const detailsStr = typeof details === "object" ? JSON.stringify(details) : (details || "");
            
            await LogModel.createLog(logId, userId, sessionId, action, detailsStr);
            return res.json({ id: logId, status: 'logged' });
        } catch (err) {
            console.error("Log telemetry error:", err);
            return res.status(500).json({ error: "Internal Error" });
        }
    }
};

module.exports = TelemetryController;
