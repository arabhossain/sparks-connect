const crypto = require("crypto");
const HostModel = require("../../models/hostModel");
const OrganizationModel = require("../../models/organizationModel");

const ClientHostController = {
    getHosts: async (req, res) => {
        try {
            let orgOwnerId = null;
            if (req.user.role === 'team_mate' && req.user.organizationId) {
                const org = await OrganizationModel.getOrganizationById(req.user.organizationId);
                if (!org) return res.json([]);
                orgOwnerId = org.ownerId;
            }

            const hosts = await HostModel.getClientHosts(req.user.id, req.user.role, orgOwnerId);
            
            const formattedHosts = hosts.map(r => ({
                id: r.id,
                name: r.name || r.ip || r.id,
                ip: r.ip,
                user: r.user,
                type: r.isShared ? 'shared' : 'personal',
                status: 'online',
                os: 'linux'
            }));

            res.json(formattedHosts);
        } catch (err) {
            console.error("Client hosts error:", err);
            res.status(500).json({ error: "Internal Error" });
        }
    },

    createHost: async (req, res) => {
        const { name, ip, user, port, isShared } = req.body;
        
        let ownerId = req.user.id;
        if (req.user.role === 'team_mate' && req.user.organizationId) {
            if (!req.user.permissions?.createHost) return res.status(403).json({error: "Forbidden"});
            const org = await OrganizationModel.getOrganizationById(req.user.organizationId);
            if (org) ownerId = org.ownerId;
        }

        try {
            const id = crypto.randomUUID();
            await HostModel.createHost(
                id, name, ip, parseInt(port)||22, user, null,
                null, null, null, null, 0, null, null, null, null, ownerId, isShared ? 1 : 0, null
            );
            res.json({ success: true, id });
        } catch (err) {
            console.error("Create host error:", err);
            res.status(500).json({ error: "Internal Error" });
        }
    },

    updateHost: async (req, res) => {
        const { id } = req.params;
        const { name, ip, user, port, isShared } = req.body;
        
        let ownerId = req.user.id;
        if (req.user.role === 'team_mate' && req.user.organizationId) {
            if (!req.user.permissions?.createHost) return res.status(403).json({error: "Forbidden"});
            const org = await OrganizationModel.getOrganizationById(req.user.organizationId);
            if (org) ownerId = org.ownerId;
        }

        try {
            const affectedRows = await HostModel.updateHost(
                id, ownerId, name, ip, parseInt(port)||22, user, null,
                null, null, null, null, 0, null, null, null, null, isShared ? 1 : 0, null
            );
            if (affectedRows === 0) return res.status(404).json({ error: "Host not found or unauthorized" });
            res.json({ success: true });
        } catch (err) {
            console.error("Update host error:", err);
            res.status(500).json({ error: "Internal Error" });
        }
    },

    deleteHost: async (req, res) => {
        const { id } = req.params;
        
        let ownerId = req.user.id;
        if (req.user.role === 'team_mate' && req.user.organizationId) {
            if (!req.user.permissions?.createHost) return res.status(403).json({error: "Forbidden"});
            const org = await OrganizationModel.getOrganizationById(req.user.organizationId);
            if (org) ownerId = org.ownerId;
        }

        try {
            const affectedRows = await HostModel.deleteHost(id, ownerId);
            if (affectedRows === 0) return res.status(404).json({ error: "Host not found or unauthorized" });
            res.json({ success: true });
        } catch (err) {
            console.error("Delete host error:", err);
            res.status(500).json({ error: "Internal Error" });
        }
    }
};

module.exports = ClientHostController;
