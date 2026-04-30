const db = require("../db");

const VaultModel = {
    getVaultByOrg: async (orgId) => {
        const [rows] = await db.query(
            "SELECT * FROM vaults WHERE org_id = ?",
            [orgId]
        );
        return rows[0];
    },

    createVault: async (id, orgId, name) => {
        await db.query(
            "INSERT INTO vaults (id, org_id, name) VALUES (?, ?, ?)",
            [id, orgId, name]
        );
    },

    getVaultItems: async (vaultId) => {
        const [rows] = await db.query(
            "SELECT * FROM vault_items WHERE vault_id = ?",
            [vaultId]
        );
        return rows;
    },

    addItem: async (id, vaultId, type, encryptedData, iv, tag) => {
        await db.query(
            "INSERT INTO vault_items (id, vault_id, type, encrypted_data, iv, tag) VALUES (?, ?, ?, ?, ?, ?)",
            [id, vaultId, type, encryptedData, iv, tag]
        );
    },

    updateItem: async (id, vaultId, type, encryptedData, iv, tag) => {
        await db.query(
            "UPDATE vault_items SET type = ?, encrypted_data = ?, iv = ?, tag = ? WHERE id = ? AND vault_id = ?",
            [type, encryptedData, iv, tag, id, vaultId]
        );
    },

    deleteItem: async (id, vaultId) => {
        await db.query(
            "DELETE FROM vault_items WHERE id = ? AND vault_id = ?",
            [id, vaultId]
        );
    }
};

module.exports = VaultModel;
