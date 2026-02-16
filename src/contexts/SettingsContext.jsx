import { createContext, useContext, useState, useEffect } from 'react';
import defaultLogo from '../assets/logo_polyglot.jpg';

const SettingsContext = createContext();

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
}

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState({
        site_name: 'Le Polyglot',
        site_description: 'La plateforme communautaire de la Catho.',
        primary_color: '#6366f1',
        secondary_color: '#8b5cf6',
        button_color: '#10b981',
        logo_url: defaultLogo,
        maintenance_mode: 'false',
        allow_registrations: 'true',
        welcome_title: 'Bienvenue sur The Polyglot',
        welcome_message: 'Connectez-vous avec des étudiants du monde entier',
        footer_text: '© 2026 The Polyglot - Tous droits réservés',
        contact_email: 'contact@thepolyglot.com',
        home_hero_title: 'The Polyglot',
        home_hero_subtitle: 'Posts, actus, projets. Un espace pour la promo.'
    });
    const [loading, setLoading] = useState(true);

    // Fonction pour appliquer tous les styles CSS depuis les settings
    const applyStylesFromSettings = (data) => {
        const cssMapping = {
            // Couleurs principales
            'primary_color': '--main-color',
            'secondary_color': '--secondary-color',
            'accent_color': '--accent-color',
            'button_color': '--button-color',
            'button_hover_color': '--button-hover-color',
            'link_color': '--link-color',
            'link_hover_color': '--link-hover-color',

            // Couleurs de fond
            'background_color': '--background-color',
            'card_background': '--card-background',
            'header_background': '--header-background',
            'footer_background': '--footer-background',

            // Couleurs de texte
            'text_color': '--text-color',
            // Couleur principale
            'main_color': '--color-primary',

            // Couleurs de fond
            'bg_site': '--color-bg-primary',
            'bg_cards': '--color-bg-secondary',

            // Couleurs de texte
            'text_main': '--color-text-primary',
            'text_light': '--color-text-secondary'
        };

        // Appliquer chaque propriété CSS
        Object.keys(cssMapping).forEach(settingKey => {
            if (data[settingKey]) {
                document.documentElement.style.setProperty(cssMapping[settingKey], data[settingKey]);
            }
        });
    };

    // Fonction pour récupérer les settings depuis l'API
    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                setSettings(data);

                // Appliquer tous les styles CSS
                applyStylesFromSettings(data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour mettre à jour les settings
    const updateSettings = async (newSettings) => {
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newSettings)
            });

            if (response.ok) {
                setSettings(prev => ({ ...prev, ...newSettings }));

                // Appliquer tous les nouveaux styles
                applyStylesFromSettings(newSettings);

                return { success: true };
            } else {
                return { success: false, error: 'Erreur lors de la mise à jour' };
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            return { success: false, error: error.message };
        }
    };

    // Charger les settings au montage du composant
    useEffect(() => {
        fetchSettings();
    }, []);

    // Fonction helper pour obtenir une valeur de texte dynamique
    const getText = (key, defaultValue = '') => {
        return settings[key] || defaultValue;
    };

    return (
        <SettingsContext.Provider value={{
            settings,
            loading,
            updateSettings,
            fetchSettings,
            getText
        }}>
            {children}
        </SettingsContext.Provider>
    );
}
