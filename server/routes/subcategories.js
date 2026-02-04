const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all subcategories for a specific category
router.get('/category/:categoryId', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.*, u.display_name as creator_name 
            FROM subcategories s
            LEFT JOIN users u ON s.created_by = u.id
            WHERE s.category_id = ?
            ORDER BY s.name ASC
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
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        const [result] = await db.query(
            'INSERT INTO subcategories (category_id, name, slug, description, created_by) VALUES (?, ?, ?, ?, ?)',
            [category_id, name, slug, description, created_by]
        );
        
        const [newSubcategory] = await db.query(
            'SELECT * FROM subcategories WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).json(newSubcategory[0]);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Cette sous-catégorie existe déjà dans cette catégorie' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

// Update a subcategory
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    
    try {
        // Générer un nouveau slug si le nom change
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        await db.query(
            'UPDATE subcategories SET name = ?, slug = ?, description = ? WHERE id = ?',
            [name, slug, description, id]
        );
        
        const [updated] = await db.query('SELECT * FROM subcategories WHERE id = ?', [id]);
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a subcategory
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        await db.query('DELETE FROM subcategories WHERE id = ?', [id]);
        res.json({ message: 'Sous-catégorie supprimée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
