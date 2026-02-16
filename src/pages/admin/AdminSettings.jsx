import { useState, useEffect } from "react";
import { useSettings } from "../../contexts/SettingsContext";
import "../../styles/Admin.css";

export default function AdminSettings() {
    const { settings: globalSettings, updateSettings } = useSettings();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('colors');

    const [settings, setSettings] = useState({});

    useEffect(() => {
        if (globalSettings) {
            setSettings(globalSettings);
        }
    }, [globalSettings]);

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    setSettings({ ...settings, logo_url: data.url });
                    setMessage('✅ Logo uploadé !');
                } else {
                    setMessage('❌ Erreur upload');
                }
            } catch (error) {
                setMessage('❌ Erreur : ' + error.message);
            }
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        setMessage('');

        try {
            const result = await updateSettings(settings);

            if (result.success) {
                setMessage('✅ Sauvegardé !');
            } else {
                setMessage('❌ Erreur');
            }
        } catch (error) {
            setMessage('❌ Erreur : ' + error.message);
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const ColorPicker = ({ label, settingKey }) => (
        <label>
            {label}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                    type="color"
                    value={settings[settingKey] || '#000000'}
                    onChange={(e) => setSettings({ ...settings, [settingKey]: e.target.value })}
                    style={{ height: '50px', width: '80px', cursor: 'pointer', border: 'none', borderRadius: '8px' }}
                />
                <input
                    type="text"
                    className="input-field"
                    value={settings[settingKey] || ''}
                    onChange={(e) => setSettings({ ...settings, [settingKey]: e.target.value })}
                    style={{ flex: 1 }}
                />
            </div>
        </label>
    );

    const tabs = [
        { id: 'logo', label: '🖼️ Logo' },
        { id: 'colors', label: '🎨 Couleurs' },
        { id: 'texts', label: '📄 Textes' }
    ];

    return (
        <div className="admin-page">
            <div className="section-header">
                <div>
                    <h1>⚙️ Paramètres du Site</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Personnalisez tout le site comme WordPress</p>
                </div>
            </div>

            {message && (
                <div style={{ padding: '1rem', marginBottom: '1rem', background: message.startsWith('✅') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${message.startsWith('✅') ? '#22c55e' : '#ef4444'}`, borderRadius: '8px', color: message.startsWith('✅') ? '#22c55e' : '#ef4444', fontWeight: '600' }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '1rem 1.5rem', background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '3px solid #6366f1' : '3px solid transparent', color: activeTab === tab.id ? '#6366f1' : '#94a3b8', cursor: 'pointer', fontSize: '1rem', fontWeight: activeTab === tab.id ? '600' : '400', transition: 'all 0.3s', whiteSpace: 'nowrap' }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div>
                {activeTab === 'logo' && (
                    <div className="content-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2>🖼️ Logo du Site</h2>
                        {settings.logo_url && <div style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}><img src={settings.logo_url} alt="Logo" style={{ maxHeight: '150px', maxWidth: '300px', objectFit: 'contain' }} /></div>}
                        <div className="settings-grid">
                            <label>URL du logo<input type="text" className="input-field" value={settings.logo_url || ''} onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })} placeholder="/src/assets/logo_polyglot.jpg" /></label>
                            <label>Upload nouveau logo<input type="file" accept="image/*" onChange={handleLogoUpload} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc', cursor: 'pointer' }} /></label>
                        </div>
                    </div>
                )}

                {activeTab === 'colors' && (
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="content-card" style={{ marginBottom: '2rem' }}>
                            <h2>🎨 Couleurs des boutons</h2>
                            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>Ces couleurs contrôlent <strong>TOUS</strong> les éléments interactifs : boutons du header, boutons d'action, liens, boutons de catégories. La couleur secondaire est utilisée pour les dégradés avec la principale.</p>
                            <div className="settings-grid">
                                <ColorPicker label="Couleur principale (boutons, liens)" settingKey="main_color" />
                                <ColorPicker label="Couleur secondaire (dégradés)" settingKey="secondary_color" />
                            </div>
                        </div>
                        <div className="content-card" style={{ marginBottom: '2rem' }}>
                            <h2>🎭 Arrière-plan et Cards</h2>
                            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>Couleurs de fond du site</p>
                            <div className="settings-grid">
                                <ColorPicker label="Fond du site (arrière-plan général)" settingKey="bg_site" />
                                <ColorPicker label="Fond des cartes (posts, events, catégories)" settingKey="bg_cards" />
                            </div>
                        </div>
                        <div className="content-card">
                            <h2>✍️ Textes</h2>
                            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>Couleurs des textes affichés</p>
                            <div className="settings-grid">
                                <ColorPicker label="Texte principal (titres, paragraphes, contenu)" settingKey="text_main" />
                                <ColorPicker label="Texte atténué (dates, placeholders, infos secondaires)" settingKey="text_light" />
                            </div>
                        </div>
                    </div>
                )}



                {activeTab === 'texts' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                        <div className="content-card"><h2>🏠 Page Accueil</h2><div className="settings-grid"><label>Titre Hero<input type="text" className="input-field" value={settings.home_hero_title || ''} onChange={(e) => setSettings({ ...settings, home_hero_title: e.target.value })} placeholder="Le Forum — Licence" /></label><label>Sous-titre Hero<input type="text" className="input-field" value={settings.home_hero_subtitle || ''} onChange={(e) => setSettings({ ...settings, home_hero_subtitle: e.target.value })} placeholder="Posts, actus, projets. Un espace pour la promo." /></label><label>Titre Bienvenue<input type="text" className="input-field" value={settings.home_welcome_title || ''} onChange={(e) => setSettings({ ...settings, home_welcome_title: e.target.value })} placeholder="Bienvenue sur The Polyglot" /></label></div></div>
                        <div className="content-card"><h2>💬 Page Forum</h2><div className="settings-grid"><label>Titre<input type="text" className="input-field" value={settings.forum_title || ''} onChange={(e) => setSettings({ ...settings, forum_title: e.target.value })} placeholder="Forum" /></label><label>Description<textarea className="input-field" value={settings.forum_description || ''} onChange={(e) => setSettings({ ...settings, forum_description: e.target.value })} rows={2} placeholder="Explorez les catégories et rejoignez les discussions" /></label></div></div>
                        <div className="content-card"><h2>📅 Page Événements</h2><div className="settings-grid"><label>Titre<input type="text" className="input-field" value={settings.events_title || ''} onChange={(e) => setSettings({ ...settings, events_title: e.target.value })} placeholder="📅 Pôle Événementiel" /></label><label>Description<textarea className="input-field" value={settings.events_description || ''} onChange={(e) => setSettings({ ...settings, events_description: e.target.value })} rows={3} placeholder="Bienvenue au Pôle Événementiel de The Polyglot..." /></label></div></div>
                    </div>
                )}
            </div>

            <div style={{ position: 'sticky', bottom: '2rem', marginTop: '3rem', display: 'flex', justifyContent: 'center', zIndex: 100 }}>
                <button className="admin-btn btn-primary" onClick={handleSaveSettings} disabled={saving} style={{ width: '400px', padding: '1.25rem 2rem', fontSize: '1.2rem', fontWeight: '700', justifyContent: 'center', boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4)', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                    {saving ? "💾 Sauvegarde..." : "💾 Sauvegarder tout"}
                </button>
            </div>
        </div>
    );
}
