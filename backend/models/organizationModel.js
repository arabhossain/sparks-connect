const db = require("../db");

const OrganizationModel = {
    getOrganizationById: async (id) => {
        const [rows] = await db.query(
            "SELECT * FROM organizations WHERE id = ?",
            [id]
        );
        return rows[0];
    },

    createOrganization: async (id, name, ownerId) => {
        await db.query(
            "INSERT INTO organizations (id, name, ownerId) VALUES (?, ?, ?)",
            [id, name, ownerId]
        );
    },

    updateOrganizationName: async (name, ownerId) => {
        await db.query(
            "UPDATE organizations SET name = ? WHERE ownerId = ?",
            [name, ownerId]
        );
    },

    getOrganizationByOwnerId: async (ownerId) => {
        const [rows] = await db.query(
            "SELECT * FROM organizations WHERE ownerId = ?",
            [ownerId]
        );
        return rows[0];
    }
};

module.exports = OrganizationModel;
