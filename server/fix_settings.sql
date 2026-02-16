-- 1. Create the settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Insert default values (same as seed-settings.js)
INSERT INTO settings (setting_key, setting_value) VALUES 
('logo_url', '/assets/logo_polyglot.jpg'), -- Adapted path for production
('main_color', '#6366f1'),
('secondary_color', '#8b5cf6'),
('bg_site', '#0f172a'),
('bg_cards', '#1e293b'),
('text_main', '#f8fafc'),
('text_light', '#94a3b8'),
('home_hero_title', 'Le Forum — Licence'),
('home_hero_subtitle', 'Posts, actus, projets. Un espace pour la promo.'),
('home_welcome_title', 'Bienvenue sur The Polyglot'),
('forum_title', 'Forum'),
('forum_description', 'Explorez les catégories et rejoignez les discussions'),
('events_title', '📅 Pôle Événementiel'),
('events_description', 'Bienvenue au Pôle Événementiel de The Polyglot ! Découvrez nos événements culturels, linguistiques et académiques.')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
