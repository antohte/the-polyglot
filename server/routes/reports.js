const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all reports
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                r.*,
                reporter.display_name as reporter_name,
                CASE 
                    WHEN r.content_type = 'post' THEN p.title
                    WHEN r.content_type = 'comment' THEN CONCAT('Comment on: ', p2.title)
                    ELSE 'User Profile'
                END as content_title,
                CASE
                    WHEN r.content_type = 'post' THEN p.author_id
                    WHEN r.content_type = 'comment' THEN c.author_id
                    WHEN r.content_type = 'user' THEN r.content_id
                END as reported_user_id,
                CASE
                    WHEN r.content_type = 'post' THEN u1.display_name
                    WHEN r.content_type = 'comment' THEN u2.display_name
                    WHEN r.content_type = 'user' THEN u3.display_name
                END as reported_user_name
            FROM reports r
            JOIN users reporter ON r.reporter_id = reporter.id
            LEFT JOIN posts p ON r.content_type = 'post' AND r.content_id = p.id
            LEFT JOIN comments c ON r.content_type = 'comment' AND r.content_id = c.id
            LEFT JOIN posts p2 ON c.post_id = p2.id
            LEFT JOIN users u1 ON p.author_id = u1.id
            LEFT JOIN users u2 ON c.author_id = u2.id
            LEFT JOIN users u3 ON r.content_type = 'user' AND r.content_id = u3.id
            ORDER BY r.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create report
router.post('/', async (req, res) => {
    const { reporter_id, content_type, content_id, reason } = req.body;
    try {
        await db.query(
            'INSERT INTO reports (reporter_id, content_type, content_id, reason) VALUES (?, ?, ?, ?)',
            [reporter_id, content_type, content_id, reason]
        );
        res.status(201).json({ message: 'Report submitted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Resolve report
router.post('/:id/resolve', async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'dismiss' or 'action_taken'
    try {
        await db.query(
            'UPDATE reports SET status = ?, resolved_at = NOW() WHERE id = ?',
            [action === 'dismiss' ? 'dismissed' : 'resolved', id]
        );
        res.json({ message: 'Report resolved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
