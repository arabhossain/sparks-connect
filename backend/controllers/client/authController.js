const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const UserModel = require("../../models/userModel");
const OrganizationModel = require("../../models/organizationModel");

const ClientAuthController = {
    register: async (req, res) => {
        const { username, password, role, orgName } = req.body;

        try {
            const id = crypto.randomUUID();
            const hash = await bcrypt.hash(password, 10);
            const assignedRole = role || "team_mate";
            let assignedOrgId = null;

            if (assignedRole === "organization_user" && orgName) {
                assignedOrgId = crypto.randomUUID();
                await OrganizationModel.createOrganization(assignedOrgId, orgName, id);
            }

            const defaultOrgPerms = JSON.stringify({ createHost: true, editShared: true, viewLogs: true, startSessions: true });
            const defaultTeamPerms = JSON.stringify({ createHost: false, editShared: false, viewLogs: false, startSessions: true });
            const permsJSON = assignedRole === "organization_user" ? defaultOrgPerms : defaultTeamPerms;

            await UserModel.createClientUser(id, username, hash, assignedRole, assignedOrgId, permsJSON);

            const permsObj = JSON.parse(permsJSON);

            const token = jwt.sign(
                { id, username, role: assignedRole, organizationId: assignedOrgId, permissions: permsObj },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            res.json({ token, user: { id, username, role: assignedRole, organizationId: assignedOrgId, permissions: permsObj } });
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(400).json({ error: "Username already exists" });
            }
            console.error("Client register error:", err);
            res.status(500).json({ error: "Internal Error" });
        }
    },

    login: async (req, res) => {
        const { username, password } = req.body;

        try {
            const user = await UserModel.getUserByUsername(username);

            if (!user) {
                return res.status(401).json({ error: "User not found" });
            }

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                return res.status(403).json({ error: "Invalid password" });
            }

            if (user.isActive === 0) {
                return res.status(403).json({ error: "Account deactivated" });
            }

            let organizationName = null;
            if (user.organizationId) {
                const org = await OrganizationModel.getOrganizationById(user.organizationId);
                if (org) organizationName = org.name;
            } else if (user.role === 'owner') {
                const org = await OrganizationModel.getOrganizationByOwnerId(user.id);
                if (org) organizationName = org.name;
            }

            const permsObj = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || { createHost: false, editShared: false, viewLogs: false, startSessions: true });

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role, organizationId: user.organizationId, permissions: permsObj },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            res.json({ token, user: { id: user.id, username: user.username, role: user.role, organizationId: user.organizationId, organizationName, permissions: permsObj } });
        } catch (err) {
            console.error("Client login error:", err);
            res.status(500).json({ error: "Internal Error" });
        }
    },

    changePassword: async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        try {
            const user = await UserModel.getUserById(req.user.id);
            if (!user) return res.status(404).json({ error: "User not found" });

            const valid = await bcrypt.compare(currentPassword, user.password);
            if (!valid) {
                return res.status(400).json({ error: "Invalid current password" });
            }

            const hash = await bcrypt.hash(newPassword, 10);
            await UserModel.updateUserPassword(req.user.id, hash);

            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: "Internal Error" });
        }
    },

    updateOrganization: async (req, res) => {
        const { name } = req.body;
        if (req.user.role !== 'organization_user' && req.user.role !== 'owner') {
            return res.status(403).json({ error: "Forbidden: Only organization owners can change the organization name" });
        }
        try {
            await OrganizationModel.updateOrganizationName(name, req.user.id);
            res.json({ success: true, name });
        } catch (err) {
            console.error("Update organization error:", err);
            res.status(500).json({ error: "Internal Error" });
        }
    }
};

module.exports = ClientAuthController;
