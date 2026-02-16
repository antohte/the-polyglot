const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/settings - Récupérer tous les paramètres
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT setting_key, setting_value FROM settings');

        // Convertir le tableau en objet clé-valeur
        const settings = {};
        rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });

        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération des paramètres',
            details: error.message
        });
    }
});

// PUT /api/settings - Mettre à jour les paramètres
router.put('/', async (req, res) => {
    try {
        const settingsToUpdate = req.body;

        // Utiliser une transaction pour mettre à jour tous les paramètres
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            for (const [key, value] of Object.entries(settingsToUpdate)) {
                await connection.query(
                    'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                    [key, value, value]
                );
            }

            await connection.commit();
            connection.release();

            res.json({ message: 'Paramètres mis à jour avec succès' });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres' });
    }
});

module.exports = router;
