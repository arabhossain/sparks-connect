const UserModel = require("../../models/userModel");

const ClientUserController = {
    getMe: async (req, res) => {
        try {
            const user = await UserModel.getUserProfile(req.user.id);
            if (!user) return res.status(404).json({ error: "User not found" });
            res.json(user);
        } catch (err) {
            console.error("Client me error:", err);
            res.status(500).json({ error: "Internal Error" });
        }
    },

    updateTrackActivity: async (req, res) => {
        const { track_activity } = req.body;
        try {
            await UserModel.updateTrackActivity(req.user.id, track_activity);
            res.json({ success: true, track_activity: track_activity ? 1 : 0 });
        } catch (err) {
            console.error("Client track_activity update error:", err);
            res.status(500).json({ error: "Internal Error" });
        }
    },

    getAllUsers: async (req, res) => {
        if (req.user.role !== 'organization_user' && req.user.role !== 'owner') {
            return res.status(403).json({ error: "Forbidden" });
        }
        try {
            const users = await UserModel.getAllUsers();
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: "Internal Error" });
        }
    }
};

module.exports = ClientUserController;
