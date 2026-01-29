const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all events
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT e.*, u.display_name as author_name, u.photo_url as author_photo
            FROM events e
            JOIN users u ON e.author_id = u.id
            ORDER BY e.event_date ASC
        `;
        const [events] = await db.query(query);
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create event
router.post('/', async (req, res) => {
    const { id, author_id, title, description, event_date, location, image_url, link } = req.body;
    try {
        await db.query(`
            INSERT INTO events (id, author_id, title, description, event_date, location, image_url, link)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, author_id, title, description, event_date, location, image_url, link]);

        const [newEvent] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
        res.status(201).json(newEvent[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update event
router.put('/:id', async (req, res) => {
    const { title, description, event_date, location, image_url, link } = req.body;
    try {
        await db.query(`
            UPDATE events 
            SET title = ?, description = ?, event_date = ?, location = ?, image_url = ?, link = ?
            WHERE id = ?
        `, [title, description, event_date, location, image_url, link, req.params.id]);

        const [updated] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete event
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
        res.json({ message: 'Event deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
