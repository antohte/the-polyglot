const db = require('../db');

async function seedSettings() {
    try {
        const settings = [
            // Logo
            { key: 'logo_url', value: '/src/assets/logo_polyglot.jpg' },
            
            // Couleur principale (boutons, liens, éléments interactifs)
            { key: 'main_color', value: '#6366f1' },
            { key: 'secondary_color', value: '#8b5cf6' },
            
            // Couleurs de fond
            { key: 'bg_site', value: '#0f172a' },
            { key: 'bg_cards', value: '#1e293b' },
            
            // Couleurs de texte
            { key: 'text_main', value: '#f8fafc' },
            { key: 'text_light', value: '#94a3b8' },
            
            // Textes - Page Accueil
            { key: 'home_hero_title', value: 'Le Forum — Licence' },
            { key: 'home_hero_subtitle', value: 'Posts, actus, projets. Un espace pour la promo.' },
            { key: 'home_welcome_title', value: 'Bienvenue sur The Polyglot' },
            
            // Textes - Forum
            { key: 'forum_title', value: 'Forum' },
            { key: 'forum_description', value: 'Explorez les catégories et rejoignez les discussions' },
            
            // Textes - Événements
            { key: 'events_title', value: '📅 Pôle Événementiel' },
            { key: 'events_description', value: 'Bienvenue au Pôle Événementiel de The Polyglot ! Découvrez nos événements culturels, linguistiques et académiques.' }
        ];

        for (const setting of settings) {
            await db.query(
                'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [setting.key, setting.value, setting.value]
            );
            console.log(`✓ ${setting.key} initialized`);
        }

        console.log('\n✅ All settings initialized successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding settings:', error);
        process.exit(1);
    }
}

seedSettings();
