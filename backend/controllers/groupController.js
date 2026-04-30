const crypto = require("crypto");
const GroupModel = require("../models/groupModel");

const GroupController = {
    getGroups: async (req, res) => {
        try {
            const userId = req.user.id;
            const groups = await GroupModel.getGroupsByOwner(userId);
            res.json(groups);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Failed to fetch groups" });
        }
    },

    createGroup: async (req, res) => {
        try {
            const userId = req.user.id;
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ message: "Group name is required" });
            }

            const id = crypto.randomUUID();

            await GroupModel.createGroup(id, name, userId);

            res.status(201).json({
                id,
                name,
                ownerId: userId
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Failed to create group" });
        }
    },

    deleteGroup: async (req, res) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const affectedRows = await GroupModel.deleteGroup(id, userId);

            if (affectedRows === 0) {
                return res.status(404).json({ message: "Group not found or unauthorized" });
            }

            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Failed to delete group" });
        }
    }
};

module.exports = GroupController;
