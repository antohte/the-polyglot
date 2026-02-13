const express = require('express');
const router = express.Router();
const db = require('../db');

const { verifyToken, verifyModeratorOrAdmin } = require('../middleware/auth');

// Get all posts (with filtering)
router.get('/', async (req, res) => {
    // ... existing ...
    try {
        const { category, subcategory } = req.query;
        let query = `
            SELECT p.*, u.display_name as author_name, u.photo_url as author_photo
            FROM posts p
            JOIN users u ON p.author_id = u.id
        `;
        const params = [];
        const conditions = [];

        if (category) {
            conditions.push('p.category_slug = ?');
            params.push(category);
        }
        if (subcategory) {
            conditions.push('p.subcategory = ?');
            params.push(subcategory);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY p.created_at DESC';

        const [posts] = await db.query(query, params);
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single post
router.get('/:id', async (req, res) => {
    // ... existing ...
    try {
        const query = `
            SELECT p.*, u.display_name as author_name, u.photo_url as author_photo
            FROM posts p
            JOIN users u ON p.author_id = u.id
            WHERE p.id = ?
        `;
        const [posts] = await db.query(query, [req.params.id]);
        if (posts.length === 0) return res.status(404).json({ error: 'Post not found' });
        res.json(posts[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create post - Authenticated users only
router.post('/', verifyToken, async (req, res) => {
    const { id, author_id, category_slug, subcategory, title, content, image_url, files, language, postType } = req.body;
    try {
        await db.query(`
            INSERT INTO posts (id, author_id, category_slug, subcategory, title, content, image_url, files, language, post_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            req.user.uid, // Use authenticated user ID security
            category_slug,
            subcategory,
            title,
            content,
            image_url,
            JSON.stringify(files || []),
            language || 'fr',
            postType || 'article'
        ]);

        const [newPost] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
        res.status(201).json(newPost[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update post - Moderator or Owner
router.put('/:id', verifyToken, async (req, res) => {
    const { title, content, image_url, category_slug, subcategory, is_pinned, files, language, postType } = req.body;

    try {
        // Check ownership if not mod/admin
        if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
            const [post] = await db.query('SELECT author_id FROM posts WHERE id = ?', [req.params.id]);
            if (post.length > 0 && post[0].author_id !== req.user.uid) {
                return res.status(403).json({ error: 'Not authorized' });
            }
        }

        await db.query(`
            UPDATE posts 
            SET title = ?, content = ?, image_url = ?, category_slug = ?, subcategory = ?, is_pinned = ?, files = ?, language = ?, post_type = ?
            WHERE id = ?
        `, [
            title,
            content,
            image_url,
            category_slug,
            subcategory,
            is_pinned,
            JSON.stringify(files || []),
            language,
            postType,
            req.params.id
        ]);

        const [updated] = await db.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete post - Moderator or Admin or Owner
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
            const [post] = await db.query('SELECT author_id FROM posts WHERE id = ?', [req.params.id]);
            if (post.length > 0 && post[0].author_id !== req.user.uid) {
                return res.status(403).json({ error: 'Not authorized' });
            }
        }

        await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- COMMENTS ---

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
    try {
        const query = `
            SELECT c.*, u.display_name as author_name, u.photo_url as author_photo
            FROM comments c
            JOIN users u ON c.author_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        `;
        const [comments] = await db.query(query, [req.params.id]);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add comment
router.post('/:id/comments', async (req, res) => {
    const { id, author_id, content } = req.body; // id is comment id
    try {
        await db.query(`
            INSERT INTO comments (id, post_id, author_id, content)
            VALUES (?, ?, ?, ?)
        `, [id, req.params.id, author_id, content]);

        const [newComment] = await db.query(`
            SELECT c.*, u.display_name as author_name 
            FROM comments c 
            JOIN users u ON c.author_id = u.id 
            WHERE c.id = ?
        `, [id]);

        res.status(201).json(newComment[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- LIKES ---

// Get likes count and status
router.get('/:id/likes', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT user_id FROM likes WHERE post_id = ?', [req.params.id]);
        res.json({ count: rows.length, user_ids: rows.map(r => r.user_id) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle like
router.post('/:id/like', async (req, res) => {
    const { user_id } = req.body;
    try {
        const [exists] = await db.query('SELECT * FROM likes WHERE post_id = ? AND user_id = ?', [req.params.id, user_id]);

        if (exists.length > 0) {
            await db.query('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [req.params.id, user_id]);
            res.json({ liked: false });
        } else {
            await db.query('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [req.params.id, user_id]);
            res.json({ liked: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
