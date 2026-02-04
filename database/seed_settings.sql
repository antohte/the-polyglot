-- Insert default settings
INSERT INTO settings (setting_key, setting_value) VALUES
('site_name', 'Le Polyglot'),
('site_description', 'La plateforme communautaire de la Catho.'),
('primary_color', '#6366f1'),
('logo_url', '/src/assets/logo_polyglot.jpg'),
('maintenance_mode', 'false'),
('allow_registrations', 'true'),
('welcome_title', 'Bienvenue sur The Polyglot'),
('welcome_message', 'Connectez-vous avec des étudiants du monde entier')
ON DUPLICATE KEY UPDATE 
    setting_value = VALUES(setting_value);
