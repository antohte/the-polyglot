const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all users
router.get('/', async (req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single user by ID
router.get('/:id', async (req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create or Update User (Upsert) - useful for syncing from Firebase Auth
router.put('/:id', async (req, res) => {
    const { email, display_name, full_name, photo_url, role, bio, social_links, license_year, department } = req.body;
    try {
        // Check if user exists
        const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [req.params.id]);

        if (existing.length > 0) {
            // Update
            await db.query(`
                UPDATE users SET 
                email = ?, display_name = ?, full_name = ?, photo_url = ?, role = COALESCE(?, role), bio = ?, social_links = ?, license_year = ?, department = ?
                WHERE id = ?
            `, [email, display_name, full_name, photo_url, role, bio, JSON.stringify(social_links || {}), license_year, department, req.params.id]);
        } else {
            // Create
            await db.query(`
                INSERT INTO users (id, email, display_name, full_name, photo_url, role, bio, social_links, license_year, department)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [req.params.id, email, display_name, full_name, photo_url, role || 'user', bio, JSON.stringify(social_links || {}), license_year, department]);
        }

        const [updated] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Delete user
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Friends Routes

// Get user's friends (accepted)
router.get('/:id/friends', async (req, res) => {
    try {
        const query = `
            SELECT u.*
            FROM users u
            JOIN friends f ON (u.id = f.requester_id OR u.id = f.addressee_id)
            WHERE (f.requester_id = ? OR f.addressee_id = ?)
            AND f.status = 'accepted'
            AND u.id != ?
        `;
        const [friends] = await db.query(query, [req.params.id, req.params.id, req.params.id]);
        res.json(friends);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get pending friend requests (received)
router.get('/:id/friends/requests', async (req, res) => {
    try {
        const query = `
            SELECT u.*, f.created_at as request_date
            FROM users u
            JOIN friends f ON u.id = f.requester_id
            WHERE f.addressee_id = ?
            AND f.status = 'pending'
        `;
        const [requests] = await db.query(query, [req.params.id]);
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send friend request
router.post('/:id/friends/request', async (req, res) => {
    const { target_id } = req.body;
    try {
        // Check if exists
        const [exists] = await db.query(`
            SELECT * FROM friends 
            WHERE (requester_id = ? AND addressee_id = ?) 
            OR (requester_id = ? AND addressee_id = ?)
        `, [req.params.id, target_id, target_id, req.params.id]);

        if (exists.length > 0) {
            return res.status(400).json({ error: 'Friendship or request already exists' });
        }

        await db.query(`
            INSERT INTO friends (requester_id, addressee_id, status)
            VALUES (?, ?, 'pending')
        `, [req.params.id, target_id]);

        res.json({ message: 'Request sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Accept friend request
router.post('/:id/friends/accept', async (req, res) => {
    const { requester_id } = req.body;
    try {
        await db.query(`
            UPDATE friends 
            SET status = 'accepted'
            WHERE requester_id = ? AND addressee_id = ? AND status = 'pending'
        `, [requester_id, req.params.id]);

        res.json({ message: 'Request accepted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove friend or cancel request
router.delete('/:id/friends/:friend_id', async (req, res) => {
    try {
        await db.query(`
            DELETE FROM friends 
            WHERE (requester_id = ? AND addressee_id = ?) 
            OR (requester_id = ? AND addressee_id = ?)
        `, [req.params.id, req.params.friend_id, req.params.friend_id, req.params.id]);

        res.json({ message: 'Removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check friendship status
router.get('/:id/friends/status/:target_id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT * FROM friends 
            WHERE (requester_id = ? AND addressee_id = ?) 
            OR (requester_id = ? AND addressee_id = ?)
        `, [req.params.id, req.params.target_id, req.params.target_id, req.params.id]);

        if (rows.length === 0) {
            return res.json({ status: 'none' });
        }

        const f = rows[0];
        if (f.status === 'accepted') {
            return res.json({ status: 'accepted' });
        }

        if (f.requester_id === req.params.id) {
            return res.json({ status: 'pending_sent' });
        } else {
            return res.json({ status: 'pending_received' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
