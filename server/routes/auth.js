const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

// Signup
router.post('/signup', async (req, res) => {
    let { email, password, full_name } = req.body;
    console.log(`Debug Signup: Step 1 Raw Email: '${email}'`);

    if (!email || !password) {
        console.log("Debug Signup: Missing fields");
        return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    const cleanEmail = email.trim().toLowerCase();
    console.log(`Debug Signup: Step 2 Clean Email: '${cleanEmail}'`);

    // Email domain validation
    const allowedDomains = ['@lacatholille.fr', '@univ-catholille.fr'];
    const isValidDomain = allowedDomains.some(domain => cleanEmail.endsWith(domain));

    if (!isValidDomain) {
        console.log(`Debug Signup: Invalid domain for '${cleanEmail}'`);
        return res.status(400).json({
            error: "Inscription réservée aux adresses @lacatholille.fr ou @univ-catholille.fr"
        });
    }

    try {
        // Check if exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
        if (existing.length > 0) {
            console.log(`Debug Signup: Email already exists '${cleanEmail}'`);
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const uid = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

        console.log(`Debug Signup: Creating user '${uid}' with email '${cleanEmail}'`);
        await db.query(`
            INSERT INTO users (id, email, password_hash, full_name, display_name, role)
            VALUES (?, ?, ?, ?, ?, 'user')
        `, [uid, cleanEmail, hashedPassword, full_name, full_name]);
        console.log("Debug Signup: Success!");

        const token = jwt.sign({ uid, email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                uid,
                email,
                full_name,
                role: 'user'
            }
        });
    } catch (err) {
        console.error("Debug Signup: Error", err);
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    let { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    email = email.trim().toLowerCase();

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        console.log(`Debug Login: Attempt for '${email}'`);

        if (users.length === 0) {
            console.log(`Debug Login: Email not found in DB.`);
            return res.status(401).json({ error: "Email ou mot de passe incorrect." });
        }

        const user = users[0];
        console.log(`Debug Login: User found (ID: ${user.id}). Checking password...`);

        // If user was migrated from Firebase, they might not have a password_hash yet.
        if (!user.password_hash) {
            console.log(`Debug Login: No password hash.`);
            return res.status(400).json({
                error: "Ce compte a été migré. Veuillez réinitialiser votre mot de passe (Non implémenté) ou créer un nouveau compte."
            });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        console.log(`Debug Login: Password match result: ${match}`);

        if (!match) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect." });
        }

        const token = jwt.sign({ uid: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                uid: user.id,
                email: user.email,
                full_name: user.full_name,
                photo_url: user.photo_url,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Me (Verify token)
router.get('/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "No token" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const [users] = await db.query('SELECT id, email, full_name, display_name, photo_url, role FROM users WHERE id = ?', [decoded.uid]);

        if (users.length === 0) return res.status(404).json({ error: "User not found" });

        const user = users[0];
        res.json({
            uid: user.id,
            email: user.email,
            full_name: user.full_name,
            displayName: user.display_name,
            photoUrl: user.photo_url,
            role: user.role
        });
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
});

module.exports = router;
