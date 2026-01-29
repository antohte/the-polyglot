const express = require('express');
const router = express.Router();
const db = require('../db');

// Get global stats
router.get('/', async (req, res) => {
    try {
        const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
        const [postCount] = await db.query('SELECT COUNT(*) as count FROM posts');
        const [eventCount] = await db.query('SELECT COUNT(*) as count FROM events');
        const [pollCount] = await db.query('SELECT COUNT(*) as count FROM polls');

        // Top Posts (by likes logic - assuming like table)
        // For now just recent posts
        const [recentPosts] = await db.query(`
            SELECT p.id, p.title, p.created_at, u.display_name as authorName 
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            ORDER BY p.created_at DESC LIMIT 5
        `);

        // Recent users
        const [recentUsers] = await db.query(`
            SELECT id, email, full_name, created_at 
            FROM users 
            ORDER BY created_at DESC LIMIT 5
        `);

        // Category stats (posts count per category)
        const [categoryStats] = await db.query(`
            SELECT category_slug as name, COUNT(*) as count 
            FROM posts 
            GROUP BY category_slug 
            ORDER BY count DESC LIMIT 5
        `);

        res.json({
            stats: {
                users: userCount[0].count,
                posts: postCount[0].count,
                events: eventCount[0].count,
                polls: pollCount[0].count,
            },
            recentPosts,
            recentUsers,
            categoryStats,
            topPosts: recentPosts // Using recent as top for now
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
