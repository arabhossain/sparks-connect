const VaultModel = require("../models/vaultModel");
const crypto = require("crypto");
const db = require("../db");

async function getUserOrgId(userId) {
    const [userRows] = await db.query("SELECT organizationId FROM users WHERE id = ?", [userId]);
    if (userRows.length && userRows[0].organizationId) {
        return userRows[0].organizationId;
    }
    
    const [orgRows] = await db.query("SELECT id FROM organizations WHERE ownerId = ?", [userId]);
    if (orgRows.length) {
        return orgRows[0].id;
    }
    
    return userId; 
}

exports.getVault = async (req, res) => {
    try {
        const orgId = await getUserOrgId(req.user.id);
        
        let vault = await VaultModel.getVaultByOrg(orgId);
        
        if (!vault) {
            const vaultId = crypto.randomUUID();
            await VaultModel.createVault(vaultId, orgId, "Primary Vault");
            vault = { id: vaultId, org_id: orgId, name: "Primary Vault" };
        }
        
        const items = await VaultModel.getVaultItems(vault.id);
        res.json({ vault, items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.addItem = async (req, res) => {
    try {
        const orgId = await getUserOrgId(req.user.id);
        const vault = await VaultModel.getVaultByOrg(orgId);
        if (!vault) {
            return res.status(404).json({ error: "Vault not found" });
        }

        const { type, encrypted_data, iv, tag } = req.body;
        const id = crypto.randomUUID();

        await VaultModel.addItem(id, vault.id, type, encrypted_data, iv, tag);
        res.json({ id, type, encrypted_data, iv, tag });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const orgId = await getUserOrgId(req.user.id);
        const vault = await VaultModel.getVaultByOrg(orgId);
        if (!vault) {
            return res.status(404).json({ error: "Vault not found" });
        }

        const { id } = req.params;
        const { type, encrypted_data, iv, tag } = req.body;

        await VaultModel.updateItem(id, vault.id, type, encrypted_data, iv, tag);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const orgId = await getUserOrgId(req.user.id);
        const vault = await VaultModel.getVaultByOrg(orgId);
        if (!vault) {
            return res.status(404).json({ error: "Vault not found" });
        }

        const { id } = req.params;
        await VaultModel.deleteItem(id, vault.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
