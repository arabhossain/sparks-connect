const db = require("../db");

const LogModel = {
    createLog: async (id, userId, sessionId, action, detailsStr) => {
        await db.query(
            "INSERT INTO activity_logs (id, userId, sessionId, action, details) VALUES (?, ?, ?, ?, ?)",
            [id, userId, sessionId || null, action, detailsStr]
        );
    },

    getClientLogs: async (userRole, userId, organizationId) => {
        let query = `
            SELECT l.id, l.action, l.details, l.createdAt, u.username
            FROM activity_logs l
            JOIN users u ON l.userId = u.id
            WHERE 1=1
        `;
        const params = [];

        if (userRole === 'organization_user') {
            query += " AND u.organizationId = ?";
            params.push(organizationId);
        } else if (userRole !== 'owner') {
            query += " AND l.userId = ?";
            params.push(userId);
        }

        query += " ORDER BY l.createdAt DESC LIMIT 100";

        const [rows] = await db.query(query, params);
        return rows;
    },

    getClientLogsBySession: async (sessionId, search, userRole, userId, organizationId, limit, offset) => {
        let query = `
            SELECT l.id, l.action, l.details, l.createdAt, u.username
            FROM activity_logs l
            JOIN users u ON l.userId = u.id
            WHERE l.sessionId = ?
        `;
        const params = [sessionId];

        if (search) {
            query += " AND JSON_EXTRACT(l.details, '$.command') LIKE ?";
            params.push(`%${search}%`);
        }

        if (userRole === 'organization_user') {
            query += " AND u.organizationId = ?";
            params.push(organizationId);
        } else if (userRole !== 'owner') {
            query += " AND l.userId = ?";
            params.push(userId);
        }

        const countQuery = `SELECT COUNT(*) as total FROM (${query}) AS sub`;
        const [[{ total }]] = await db.query(countQuery, params);

        query += " ORDER BY l.createdAt DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await db.query(query, params);
        return { rows, total };
    }
};

module.exports = LogModel;
