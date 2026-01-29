const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all polls
router.get('/', async (req, res) => {
    try {
        // Get Polls
        const [polls] = await db.query(`
            SELECT p.*, u.display_name as creator_name 
            FROM polls p
            JOIN users u ON p.created_by = u.id
            ORDER BY p.created_at DESC
        `);

        // Helper to get options and votes for a poll
        const pollsWithData = await Promise.all(polls.map(async (poll) => {
            const [options] = await db.query('SELECT * FROM poll_options WHERE poll_id = ?', [poll.id]);

            // Get vote counts per option
            const [votes] = await db.query('SELECT option_id, COUNT(*) as count FROM poll_votes WHERE poll_id = ? GROUP BY option_id', [poll.id]);

            const optionsWithVotes = options.map(opt => ({
                ...opt,
                votes: votes.find(v => v.option_id === opt.id)?.count || 0
            }));

            return { ...poll, options: optionsWithVotes };
        }));

        res.json(pollsWithData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Vote
router.post('/:id/vote', async (req, res) => {
    const { user_id, option_id } = req.body;
    try {
        // Check if already voted
        const [existing] = await db.query('SELECT * FROM poll_votes WHERE poll_id = ? AND user_id = ?', [req.params.id, user_id]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Already voted' });
        }

        await db.query('INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES (?, ?, ?)', [req.params.id, option_id, user_id]);
        res.json({ message: 'Vote recorded' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Poll
router.post('/', async (req, res) => {
    const { id, created_by, question, options, expires_at } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query('INSERT INTO polls (id, created_by, question, expires_at) VALUES (?, ?, ?, ?)', [id, created_by, question, expires_at]);

        for (const option of options) {
            await connection.query('INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)', [id, option]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Poll created' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
