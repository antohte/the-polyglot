const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all subcategories for a specific category
router.get('/category/:categoryId', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT *
            FROM categories
            WHERE parent_id = ?
            ORDER BY name ASC
        `, [req.params.categoryId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new subcategory
router.post('/', async (req, res) => {
    const { category_id, name, description, created_by } = req.body;

    try {
        // Générer un slug à partir du nom
        const slug = name.toString().toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Check if slug exists to avoid error
        const [existing] = await db.query('SELECT id FROM categories WHERE slug = ?', [slug]);
        if (existing.length > 0) {
            // If slug exists, maybe append random number? or fail?
            // Since it IS a subcategory, maybe we don't care about global uniqueness if we query by parent? 
            // BUT schema says slug is UNIQUE.
            // Let's rely on catch block or append duplicate logic if needed. 
            // For now, strict unique slug.
        }

        const [result] = await db.query(
            'INSERT INTO categories (parent_id, name, slug, description) VALUES (?, ?, ?, ?)',
            [category_id, name, slug, description || ""]
        );

        const [newSubcategory] = await db.query(
            'SELECT * FROM categories WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newSubcategory[0]);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Une catégorie avec ce nom (slug) existe déjà.' });
        } else {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }
});

// Update a subcategory
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        // Generate new slug
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        await db.query(
            'UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?',
            [name, slug, description, id]
        );

        const [updated] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a subcategory
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: 'Sous-catégorie supprimée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
