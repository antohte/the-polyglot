import { useState } from "react";
import "../../styles/Admin.css";

export default function AdminSettings() {
    const [saving, setSaving] = useState(false);

    const [settings, setSettings] = useState({
        siteName: "Le Polyglot",
        siteDescription: "La plateforme communautaire de la Catho.",
        maintenanceMode: false,
        allowRegistrations: true,
        primaryColor: "#6366f1"
    });

    const handleSaveSettings = () => {
        setSaving(true);
        // Simulate save
        setTimeout(() => {
            setSaving(false);
            alert("✅ Paramètres sauvegardés (Simulation)");
        }, 800);
    };

    return (
        <div className="admin-page">
            <div className="section-header">
                <div>
                    <h1>⚙️ Paramètres</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Configuration globale de la plateforme.</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                {/* General Settings */}
                <div className="content-card">
                    <h2 style={{ color: '#f8fafc', margin: '0 0 1.5rem 0' }}>📝 Informations Générales</h2>
                    <div className="settings-grid">
                        <label>
                            Nom du site
                            <input
                                type="text"
                                className="input-field"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                            />
                        </label>
                        <label>
                            Description
                            <textarea
                                className="input-field"
                                value={settings.siteDescription}
                                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                                rows={4}
                            />
                        </label>
                    </div>
                </div>

                {/* System Settings */}
                <div className="content-card">
                    <h2 style={{ color: '#f8fafc', margin: '0 0 1.5rem 0' }}>🔧 Système</h2>
                    <div className="settings-grid">
                        <label style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                            <span>Mode Maintenance</span>
                            <div
                                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                style={{
                                    width: '50px', height: '26px',
                                    background: settings.maintenanceMode ? '#ef4444' : '#334155',
                                    borderRadius: '50px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
                                }}
                            >
                                <div style={{
                                    width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                                    position: 'absolute', top: '3px',
                                    left: settings.maintenanceMode ? '27px' : '3px',
                                    transition: 'all 0.3s'
                                }} />
                            </div>
                        </label>

                        <label style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                            <span>Autoriser les inscriptions</span>
                            <div
                                onClick={() => setSettings({ ...settings, allowRegistrations: !settings.allowRegistrations })}
                                style={{
                                    width: '50px', height: '26px',
                                    background: settings.allowRegistrations ? '#22c55e' : '#334155',
                                    borderRadius: '50px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
                                }}
                            >
                                <div style={{
                                    width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                                    position: 'absolute', top: '3px',
                                    left: settings.allowRegistrations ? '27px' : '3px',
                                    transition: 'all 0.3s'
                                }} />
                            </div>
                        </label>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            className="btn-primary"
                            onClick={handleSaveSettings}
                            disabled={saving}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {saving ? "Sauvegarde en cours..." : "Sauvegarder les modifications"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
