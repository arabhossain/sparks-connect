const crypto = require("crypto");
const HostModel = require("../models/hostModel");
const OrganizationModel = require("../models/organizationModel");
const { encrypt, decrypt } = require("../utils/crypto");

const HostController = {
    getHosts: async (req, res) => {
        try {
            let hosts = [];

            if (req.user.role === 'team_mate' && req.user.organizationId) {
                const org = await OrganizationModel.getOrganizationById(req.user.organizationId);
                if (org) {
                    hosts = await HostModel.getHostsForTeammate(org.ownerId, req.user.id);
                }
            } else {
                hosts = await HostModel.getHostsForOwner(req.user.id);
            }

            const result = [];

            for (const host of hosts) {
                let jumpHost = null;
                if (host.jumpHostId) {
                    jumpHost = await HostModel.getJumpHostDetails(host.jumpHostId) || null;
                }

                result.push({
                    ...host,
                    password: host.passwordEnc ? decrypt(host.passwordEnc) : null,
                    sshKey: host.sshKeyEnc ? decrypt(host.sshKeyEnc) : null,
                    passphrase: host.passphraseEnc ? decrypt(host.passphraseEnc) : null,
                    jumpHost,
                    identitiesOnly: !!host.identitiesOnly,
                    isShared: !!host.isShared,
                });
            }

            res.json(result);
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    },

    createHost: async (req, res) => {
        try {
            let finalOwnerId = req.user.id;

            if (req.user.role === 'team_mate' && req.user.organizationId) {
                if (!req.user.permissions?.createHost) {
                    return res.status(403).json({ error: "Forbidden: You don't have permission to create hosts." });
                }
                const org = await OrganizationModel.getOrganizationById(req.user.organizationId);
                if (org) {
                    finalOwnerId = org.ownerId;
                }
            }

            const {
                name, host, port = 22, user, authType, password, sshKey, passphrase,
                identityFile, identitiesOnly = false, proxyCommand, proxyJump,
                group, description, isShared = false, jumpHostId = null
            } = req.body;

            const id = crypto.randomUUID();

            await HostModel.createHost(
                id, name, host, port, user, authType,
                password ? encrypt(password) : null,
                sshKey ? encrypt(sshKey) : null,
                passphrase ? encrypt(passphrase) : null,
                identityFile || null,
                identitiesOnly ? 1 : 0,
                proxyCommand || null,
                proxyJump || null,
                group || null,
                description,
                finalOwnerId,
                isShared ? 1 : 0,
                jumpHostId || null
            );

            res.json({ id });

        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    },

    updateHost: async (req, res) => {
        try {
            const { id } = req.params;

            let finalOwnerId = req.user.id;
            if (req.user.role === 'team_mate' && req.user.organizationId) {
                if (!req.user.permissions?.createHost) {
                    return res.status(403).json({ error: "Forbidden" });
                }
                const org = await OrganizationModel.getOrganizationById(req.user.organizationId);
                if (org) {
                    finalOwnerId = org.ownerId;
                }
            }

            const {
                name, host, port = 22, user, authType, password, sshKey, passphrase,
                identityFile, identitiesOnly, proxyCommand, proxyJump,
                group, description, isShared, jumpHostId = null
            } = req.body;

            const affectedRows = await HostModel.updateHost(
                id, finalOwnerId, name, host, port, user, authType,
                password ? encrypt(password) : null,
                sshKey ? encrypt(sshKey) : null,
                passphrase ? encrypt(passphrase) : null,
                identityFile || null,
                identitiesOnly ? 1 : 0,
                proxyCommand || null,
                proxyJump || null,
                group || null,
                description,
                isShared ? 1 : 0,
                jumpHostId || null
            );

            if (affectedRows === 0) {
                return res.status(404).json({ success: false, message: "Host not found or unauthorized" });
            }

            res.json({ success: true });

        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    },

    deleteHost: async (req, res) => {
        try {
            const { id } = req.params;

            let finalOwnerId = req.user.id;
            if (req.user.role === 'team_mate' && req.user.organizationId) {
                if (!req.user.permissions?.createHost) {
                    return res.status(403).json({ error: "Forbidden" });
                }
                const org = await OrganizationModel.getOrganizationById(req.user.organizationId);
                if (org) {
                    finalOwnerId = org.ownerId;
                }
            }

            const affectedRows = await HostModel.deleteHost(id, finalOwnerId);

            if (affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Host not found or unauthorized"
                });
            }

            return res.json({
                success: true,
                message: "Host deleted successfully"
            });

        } catch (err) {
            console.error("Delete host error:", err);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    }
};

module.exports = HostController;
