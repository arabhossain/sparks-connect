const express = require("express");
const db = require("../../db");
const auth = require("../../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id;

        let query = `
            SELECT l.id, l.action, l.details, l.createdAt, u.username
            FROM activity_logs l
            JOIN users u ON l.userId = u.id
            WHERE 1=1
        `;
        const params = [];

        if (userRole === 'organization_user') {
            query += " AND u.organizationId = ?";
            params.push(req.user.organizationId);
        } else if (userRole !== 'owner') {
            // Team mates only see their own logs
            query += " AND l.userId = ?";
            params.push(userId);
        }

        query += " ORDER BY l.createdAt DESC LIMIT 100";

        const [rows] = await db.query(query, params);
        
        // Parse details json safely
        const parsedRows = rows.map(r => {
            let parsedDetails = r.details;
            try { if(r.details) parsedDetails = JSON.parse(r.details); } catch(e){}
            return {
                ...r,
                details: parsedDetails
            };
        });

        res.json(parsedRows);
    } catch (err) {
        console.error("Client logs error:", err);
        res.status(500).json({ error: "Internal Error" });
    }
});

// GET /api/logs/session/:sessionId
router.get("/session/:sessionId", auth, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = 30;
        const offset = (page - 1) * limit;
        
        const userRole = req.user.role;
        const userId = req.user.id;

        // Ensure user can access this session
        // Either they own the session or they are organization_user for that session's owner
        // sessionId is now a native column
        let query = `
            SELECT l.id, l.action, l.details, l.createdAt, u.username
            FROM activity_logs l
            JOIN users u ON l.userId = u.id
            WHERE l.sessionId = ?
        `;
        const params = [sessionId];

        if (req.query.search) {
            query += " AND JSON_EXTRACT(l.details, '$.command') LIKE ?";
            params.push(`%${req.query.search}%`);
        }

        if (userRole === 'organization_user') {
            query += " AND u.organizationId = ?";
            params.push(req.user.organizationId);
        } else if (userRole !== 'owner') {
            query += " AND l.userId = ?";
            params.push(userId);
        }

        const countQuery = `SELECT COUNT(*) as total FROM (${query}) AS sub`;
        const [[{ total }]] = await db.query(countQuery, params);

        query += " ORDER BY l.createdAt DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await db.query(query, params);
        
        const parsedRows = rows.map(r => {
            let parsedDetails = r.details;
            try { if(r.details) parsedDetails = JSON.parse(r.details); } catch(e){}
            return {
                ...r,
                details: parsedDetails
            };
        });

        res.json({
            data: parsedRows,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("Session logs fetch error:", err);
        res.status(500).json({ error: "Internal Error" });
    }
});

module.exports = router;
