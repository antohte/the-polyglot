// Signup
router.post('/signup', async (req, res) => {
    let { email, password, full_name } = req.body;
    console.log(`Debug Signup: Attempt for '${email}'`);

    if (!email || !password) {
        console.log("Debug Signup: Missing fields");
        return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    email = email.trim().toLowerCase();

    // Email domain validation
    const allowedDomains = ['@lacatholille.fr', '@univ-catholille.fr'];
    const isValidDomain = allowedDomains.some(domain => email.endsWith(domain));

    if (!isValidDomain) {
        console.log(`Debug Signup: Invalid domain for '${email}'`);
        return res.status(400).json({
            error: "Inscription réservée aux adresses @lacatholille.fr ou @univ-catholille.fr"
        });
    }

    try {
        // Check if exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.log(`Debug Signup: Email already exists '${email}'`);
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const uid = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

        console.log(`Debug Signup: Creating user '${uid}' in DB...`);
        await db.query(`
            INSERT INTO users (id, email, password_hash, full_name, display_name, role)
            VALUES (?, ?, ?, ?, ?, 'user')
        `, [uid, email, hashedPassword, full_name, full_name]);
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
