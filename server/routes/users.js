const express = require('express');
const router = express.Router();
const db = require('../db');

const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Get all users (Admin only likely, or at least authenticated)
router.get('/', verifyToken, async (req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single user by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create or Update User (Upsert) - useful for syncing from Firebase Auth
router.put('/:id', verifyToken, async (req, res) => {
    const { email, display_name, full_name, photo_url, role, bio, social_links, license_year, department } = req.body;

    // Authorization Check: prevent role escalation, BUT allow profile updates
    // if role is present but user is not admin, we just ignore the role update instead of blocking the whole request.
    const tryingToUpdateRole = role !== undefined && role !== null;
    const isAdmin = req.user.role === 'admin';

    // If trying to update role AND not admin, we will just use the current role (ignore the request change)
    // We fetch current role inside the logic below.

    try {
        // Check if user exists
        const [existing] = await db.query('SELECT id, role FROM users WHERE id = ?', [req.params.id]);

        if (existing.length > 0) {
            // Update
            const currentUser = existing[0];

            // If user is admin (and role is provided), use new role.
            // If user is NOT admin, use EXISTING role (prevent change).
            const finalRole = (isAdmin && tryingToUpdateRole) ? role : currentUser.role;

            await db.query(`
                UPDATE users SET 
                email = COALESCE(?, email), display_name = ?, full_name = ?, photo_url = ?, role = ?, bio = ?, location = ?, interests = ?, social_links = ?, license_year = ?, department = ?
                WHERE id = ?
            `, [
                email,
                display_name,
                full_name,
                photo_url,
                finalRole,
                bio,
                req.body.location, // New field 
                req.body.interests, // New field
                JSON.stringify(social_links || {}),
                license_year,
                department,
                req.params.id
            ]);
        } else {
            // Create - Only Admins should create users via this route usually
            // If normal user tries to PUT to create (unlikely with this logic flow if auth is checked), force user role.
            const forcedRole = (isAdmin && role) ? role : 'user';

            await db.query(`
                INSERT INTO users (id, email, display_name, full_name, photo_url, role, bio, location, interests, social_links, license_year, department)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                req.params.id,
                email,
                display_name,
                full_name,
                photo_url,
                forcedRole,
                bio,
                req.body.location,
                req.body.interests,
                JSON.stringify(social_links || {}),
                license_year,
                department
            ]);
        }

        const [updated] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Delete user
router.delete('/:id', verifyAdmin, async (req, res) => {
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
