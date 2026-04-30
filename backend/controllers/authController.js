const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const UserModel = require("../models/userModel");
const OrganizationModel = require("../models/organizationModel");

const AuthController = {
    register: async (req, res) => {
        const { username, password } = req.body;

        try {
            const id = crypto.randomUUID();
            const hash = await bcrypt.hash(password, 10);

            await UserModel.createUser(id, username, hash, 'individual');

            res.json({ id, username });
        } catch (err) {
            res.status(400).json(err);
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

            if (!user.isActive) {
                return res.status(403).json({ error: "Account deactivated" });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            let organizationName = null;
            if (user.organizationId) {
                const org = await OrganizationModel.getOrganizationById(user.organizationId);
                if (org) {
                    organizationName = org.name;
                }
            } else if (user.role === 'individual') {
                const org = await OrganizationModel.getOrganizationByOwnerId(user.id);
                if (org) {
                    organizationName = org.name;
                }
            }

            res.json({ 
                token, 
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    organizationName: organizationName,
                    permissions: user.permissions
                }
            });
        } catch (err) {
            res.status(500).json(err);
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
    }
};

module.exports = AuthController;
