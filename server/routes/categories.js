const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create category (or subcategory)
router.post('/', async (req, res) => {
    const { slug, name, description, parent_id, created_by } = req.body;
    // Generate slug if not provided or clean it
    let finalSlug = slug;
    if (!finalSlug || finalSlug.trim() === '') {
        finalSlug = name.toString().toLowerCase()
            .normalize('NFD') // Split accented characters
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
    }

    const finalParentId = (parent_id && parent_id !== '') ? parent_id : null;

    try {
        await db.query('INSERT INTO categories (slug, name, description, parent_id) VALUES (?, ?, ?, ?)',
            [finalSlug, name, description, finalParentId]);

        const [newCat] = await db.query('SELECT * FROM categories WHERE slug = ?', [finalSlug]);
        res.status(201).json(newCat[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create category request
router.post('/requests', async (req, res) => {
    const { requested_by, category_name, reason } = req.body;
    try {
        await db.query('INSERT INTO category_requests (requested_by, category_name, reason) VALUES (?, ?, ?)',
            [requested_by, category_name, reason]);
        res.status(201).json({ message: 'Request submitted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get category requests
router.get('/requests', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT cr.*, u.display_name as requester_name 
            FROM category_requests cr
            JOIN users u ON cr.requested_by = u.id
            WHERE cr.status = 'pending'
            ORDER BY cr.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Approve request
router.post('/requests/:id/approve', async (req, res) => {
    const { id } = req.params;
    const client = await db.getConnection();
    try {
        await client.beginTransaction();

        // 1. Get request
        const [reqs] = await client.query('SELECT * FROM category_requests WHERE id = ?', [id]);
        if (reqs.length === 0) {
            await client.rollback();
            return res.status(404).json({ error: "Request not found" });
        }
        const request = reqs[0];

        if (request.status !== 'pending') {
            await client.rollback();
            return res.status(400).json({ error: "Request already processed" });
        }

        // 2. Create Category
        // Generate a simple slug from name if not present (though requests don't have slug col in DB? logic check needed)
        // Schema for category_requests: requested_by, category_name, reason, status, created_at
        // Categories needs: slug, name, description
        const slug = request.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        // Check if category exists
        const [existing] = await client.query('SELECT id FROM categories WHERE slug = ?', [slug]);
        if (existing.length > 0) {
            // If exists, maybe just approve the request as "done" but don't insert? 
            // Or fail? Let's just create it if not exists.
        } else {
            await client.query('INSERT INTO categories (slug, name, description) VALUES (?, ?, ?)',
                [slug, request.category_name, request.reason || "Created from request"]);
        }

        // 3. Update Request Status
        await client.query('UPDATE category_requests SET status = ? WHERE id = ?', ['approved', id]);

        await client.commit();
        res.json({ message: "Category approved and created" });
    } catch (err) {
        await client.rollback();
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Reject request
router.post('/requests/:id/reject', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE category_requests SET status = ? WHERE id = ?', ['rejected', id]);
        res.json({ message: "Request rejected" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete category
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Optional: Check if used in posts? For now, we assume cascade or simple delete.
        // If foreign keys are set to RESTRICT, this might fail if posts exist.
        // We will try to delete.
        await db.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: "Category deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
