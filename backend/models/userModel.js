const db = require("../db");

const UserModel = {
    createUser: async (id, username, hash, role) => {
        await db.query(
            "INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)",
            [id, username, hash, role || 'individual']
        );
    },

    createClientUser: async (id, username, hash, role, organizationId, permissions) => {
        await db.query(
            "INSERT INTO users (id, username, password, role, organizationId, permissions) VALUES (?, ?, ?, ?, ?, ?)",
            [id, username, hash, role, organizationId, permissions]
        );
    },

    getUserByUsername: async (username) => {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );
        return rows[0];
    },

    getUserById: async (id) => {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE id = ?",
            [id]
        );
        return rows[0];
    },

    getUserProfile: async (id) => {
        const [rows] = await db.query(
            "SELECT id, username, role, track_activity FROM users WHERE id = ?",
            [id]
        );
        return rows[0];
    },

    updateTrackActivity: async (id, track_activity) => {
        await db.query(
            "UPDATE users SET track_activity = ? WHERE id = ?",
            [track_activity ? 1 : 0, id]
        );
    },

    getAllUsers: async () => {
        const [rows] = await db.query("SELECT id, username, role, track_activity FROM users");
        return rows;
    },

    getTeamMembers: async (organizationId) => {
        const [rows] = await db.query("SELECT id, username, role, permissions, isActive FROM users WHERE organizationId = ?", [organizationId]);
        return rows;
    },

    updatePermissions: async (id, organizationId, permissions) => {
        await db.query("UPDATE users SET permissions = ? WHERE id = ? AND organizationId = ?", [permissions, id, organizationId]);
    },

    updateStatus: async (id, organizationId, isActive) => {
        await db.query("UPDATE users SET isActive = ? WHERE id = ? AND organizationId = ?", [isActive ? 1 : 0, id, organizationId]);
    },

    deleteTeamMember: async (id, organizationId) => {
        await db.query("DELETE FROM users WHERE id = ? AND organizationId = ?", [id, organizationId]);
    },

    updateUserPassword: async (id, hash) => {
        await db.query(
            "UPDATE users SET password = ? WHERE id = ?",
            [hash, id]
        );
    }
};

module.exports = UserModel;
