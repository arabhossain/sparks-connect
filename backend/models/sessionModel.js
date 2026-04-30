const db = require("../db");

const SessionModel = {
    getActiveSession: async (userId, hostId) => {
        const [rows] = await db.query(
            "SELECT id FROM active_sessions WHERE userId = ? AND hostId = ? AND status = 'active'",
            [userId, hostId]
        );
        return rows[0];
    },

    updateSessionHeartbeat: async (id, status) => {
        await db.query(
            "UPDATE active_sessions SET lastActive = CURRENT_TIMESTAMP, status = ? WHERE id = ?",
            [status || 'active', id]
        );
    },

    createSession: async (id, userId, hostId, status) => {
        await db.query(
            "INSERT INTO active_sessions (id, userId, hostId, status) VALUES (?, ?, ?, ?)",
            [id, userId, hostId, status || 'active']
        );
    },

    getClientSessions: async (userRole, userId, organizationId, status) => {
        let query = `
            SELECT s.id, s.startedAt, s.lastActive, s.status, u.username, h.name as hostName 
            FROM active_sessions s
            JOIN users u ON s.userId = u.id
            LEFT JOIN hosts h ON s.hostId = h.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += " AND s.status = ?";
            params.push(status);
        }

        if (userRole === 'organization_user') {
            query += " AND u.organizationId = ?";
            params.push(organizationId);
        } else if (userRole !== 'individual') {
            query += " AND s.userId = ?";
            params.push(userId);
        }

        query += " ORDER BY s.lastActive DESC";

        const [rows] = await db.query(query, params);
        return rows;
    }
};

module.exports = SessionModel;
