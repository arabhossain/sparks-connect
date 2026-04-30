const db = require("../db");

const GroupModel = {
    getGroupsByOwner: async (ownerId) => {
        const [rows] = await db.query(
            "SELECT * FROM user_groups WHERE ownerId = ?",
            [ownerId]
        );
        return rows;
    },

    createGroup: async (id, name, ownerId) => {
        await db.query(
            "INSERT INTO user_groups (id, name, ownerId) VALUES (?, ?, ?)",
            [id, name, ownerId]
        );
    },

    deleteGroup: async (id, ownerId) => {
        const [result] = await db.query(
            "DELETE FROM user_groups WHERE id = ? AND ownerId = ?",
            [id, ownerId]
        );
        return result.affectedRows;
    }
};

module.exports = GroupModel;
