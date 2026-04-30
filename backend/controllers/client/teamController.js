const UserModel = require("../../models/userModel");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const ClientTeamController = {
    getTeam: async (req, res) => {
        try {
            if (!req.user.organizationId) {
                 return res.json([]);
            }
            const rows = await UserModel.getTeamMembers(req.user.organizationId);
            
            const uiMapped = rows.map(r => {
                let uiRole = 'Member';
                if (r.role === 'organization_user' || r.role === 'individual') uiRole = 'Admin';
                
                return {
                    id: r.id,
                    name: r.username,
                    email: r.username,
                    role: uiRole,
                    status: r.isActive === null || r.isActive === 1 ? 'Active' : 'Inactive',
                    permissions: r.permissions || {
                        createHost: uiRole === 'Admin',
                        editShared: uiRole === 'Admin',
                        viewLogs: uiRole === 'Admin',
                        startSessions: true
                    }
                };
            });

            res.json(uiMapped);
        } catch (err) {
            console.error("Client team error:", err);
            res.status(500).json({ error: "Internal Error" });
        }
    },

    inviteTeammate: async (req, res) => {
        if (req.user.role !== 'organization_user' || !req.user.organizationId) {
            return res.status(403).json({ error: "Forbidden: Only Organization accounts can invite members." });
        }

        const { email } = req.body;
        try {
            const id = crypto.randomUUID();
            const tempPassword = crypto.randomBytes(8).toString('hex');
            const hash = await bcrypt.hash(tempPassword, 10);
            
            const defaultTeamPerms = JSON.stringify({ createHost: false, editShared: false, viewLogs: false, startSessions: true });
            
            await UserModel.createClientUser(id, email, hash, 'team_mate', req.user.organizationId, defaultTeamPerms);

            res.json({ message: "Teammate created successfully", tempPassword });
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(400).json({ error: "Username already exists" });
            }
            res.status(500).json({ error: "Internal error creating teammate" });
        }
    },

    updatePermissions: async (req, res) => {
        if (req.user.role !== 'organization_user' || !req.user.organizationId) {
            return res.status(403).json({ error: "Forbidden: Only Organization accounts can edit permissions." });
        }

        try {
            await UserModel.updatePermissions(req.params.id, req.user.organizationId, JSON.stringify(req.body.permissions));
            res.json({ success: true });
        } catch (err) {
            console.error("Permission update error:", err);
            res.status(500).json({ error: "Internal error updating permissions" });
        }
    },

    updateStatus: async (req, res) => {
        if (req.user.role !== 'organization_user' || !req.user.organizationId) {
            return res.status(403).json({ error: "Forbidden" });
        }
        try {
            const { isActive } = req.body;
            await UserModel.updateStatus(req.params.id, req.user.organizationId, isActive);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: "Internal error" });
        }
    },

    deleteTeammate: async (req, res) => {
        if (req.user.role !== 'organization_user' || !req.user.organizationId) {
            return res.status(403).json({ error: "Forbidden" });
        }
        try {
            await UserModel.deleteTeamMember(req.params.id, req.user.organizationId);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: "Internal error" });
        }
    }
};

module.exports = ClientTeamController;
