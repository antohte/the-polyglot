import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import "../../styles/Admin.css";

export default function AdminSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState("");
    
    const [settings, setSettings] = useState({
        siteName: "Le Forum — Licence",
        siteDescription: "Posts, actus, projets. Un espace pour la promo.",
        maintenanceMode: false,
        primaryColor: "#6366f1",
        darkMode: false,
        logoUrl: "",
        maxFileSize: 5, // MB
        maxPostsPerDay: 10,
        maxPostLength: 5000,
    });

    const [categories, setCategories] = useState([
        { name: "Stages / Formation / Masterclasses", slug: "stages-formation" },
        { name: "Journalisme", slug: "journalisme" },
        { name: "Actualités : Licence / Fac / Catho", slug: "actualites" },
        { name: "Production / Langues : langue", slug: "production-langues" },
        { name: "Humanitaire / Bénévolat", slug: "humanitaire" },
    ]);

    const [newCategory, setNewCategory] = useState({ name: "", slug: "" });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const docRef = doc(db, "settings", "site");
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                setSettings(prev => ({ ...prev, ...docSnap.data() }));
            }
            
            // Fetch categories
            const catRef = doc(db, "settings", "categories");
            const catSnap = await getDoc(catRef);
            if (catSnap.exists() && catSnap.data().list) {
                setCategories(catSnap.data().list);
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const uploadLogo = async () => {
        if (!logoFile) return settings.logoUrl;
        
        try {
            const fileRef = ref(storage, `site/logo_${Date.now()}`);
            await uploadBytes(fileRef, logoFile);
            const url = await getDownloadURL(fileRef);
            return url;
        } catch (err) {
            console.error("Error uploading logo:", err);
            return settings.logoUrl;
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            let logoUrl = settings.logoUrl;
            if (logoFile) {
                logoUrl = await uploadLogo();
            }

            const updatedSettings = { ...settings, logoUrl };
            await setDoc(doc(db, "settings", "site"), updatedSettings);
            setSettings(updatedSettings);
            setLogoFile(null);
            setLogoPreview("");
            alert("✅ Paramètres sauvegardés avec succès !");
        } catch (err) {
            console.error("Error saving settings:", err);
            alert("❌ Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveCategories = async () => {
        try {
            await setDoc(doc(db, "settings", "categories"), { list: categories });
            alert("✅ Catégories sauvegardées !");
        } catch (err) {
            console.error("Error saving categories:", err);
            alert("❌ Erreur lors de la sauvegarde");
        }
    };

    const addCategory = () => {
        if (!newCategory.name.trim()) return;
        
        const slug = newCategory.slug || newCategory.name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        
        setCategories([...categories, { name: newCategory.name, slug }]);
        setNewCategory({ name: "", slug: "" });
    };

    const removeCategory = (index) => {
        if (!window.confirm("Supprimer cette catégorie ?")) return;
        setCategories(categories.filter((_, i) => i !== index));
    };

    if (loading) return <div className="admin-loading">Chargement des paramètres...</div>;

    return (
        <div className="admin-page">
            <h1>⚙️ Paramètres du Site</h1>

            {/* Site Info */}
            <div className="settings-section">
                <h2>📝 Informations du Site</h2>
                <div className="settings-grid">
                    <label>
                        Nom du site
                        <input
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
                            rows={3}
                        />
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input
                            type="checkbox"
                            checked={settings.maintenanceMode}
                            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                        />
                        Mode Maintenance
                    </label>
                </div>
            </div>

            {/* Theme */}
            <div className="settings-section">
                <h2>🎨 Thème et Personnalisation</h2>
                <div className="settings-grid">
                    <label>
                        Logo du site
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="input-field"
                        />
                        {(logoPreview || settings.logoUrl) && (
                            <img 
                                src={logoPreview || settings.logoUrl} 
                                alt="Logo preview" 
                                style={{ maxWidth: "200px", marginTop: "0.5rem", borderRadius: "8px" }}
                            />
                        )}
                    </label>

                    <label>
                        Couleur Primaire
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <input
                                type="color"
                                value={settings.primaryColor}
                                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                style={{ width: "60px", height: "40px", cursor: "pointer" }}
                            />
                            <input
                                className="input-field"
                                value={settings.primaryColor}
                                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                placeholder="#6366f1"
                            />
                        </div>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input
                            type="checkbox"
                            checked={settings.darkMode}
                            onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                        />
                        Mode Sombre par défaut
                    </label>
                </div>
            </div>

            {/* Limits */}
            <div className="settings-section">
                <h2>🔒 Limites et Restrictions</h2>
                <div className="settings-grid">
                    <label>
                        Taille max des fichiers (MB)
                        <input
                            type="number"
                            className="input-field"
                            value={settings.maxFileSize}
                            onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })}
                            min="1"
                            max="50"
                        />
                    </label>

                    <label>
                        Posts max par jour (par utilisateur)
                        <input
                            type="number"
                            className="input-field"
                            value={settings.maxPostsPerDay}
                            onChange={(e) => setSettings({ ...settings, maxPostsPerDay: parseInt(e.target.value) })}
                            min="1"
                            max="100"
                        />
                    </label>

                    <label>
                        Longueur max d'un post (caractères)
                        <input
                            type="number"
                            className="input-field"
                            value={settings.maxPostLength}
                            onChange={(e) => setSettings({ ...settings, maxPostLength: parseInt(e.target.value) })}
                            min="100"
                            max="50000"
                        />
                    </label>
                </div>
            </div>

            <button 
                className="admin-btn btn-success" 
                onClick={handleSaveSettings}
                disabled={saving}
                style={{ marginTop: "1rem", width: "100%" }}
            >
                {saving ? "⏳ Sauvegarde..." : "💾 Sauvegarder les Paramètres"}
            </button>

            {/* Categories Management */}
            <div className="settings-section" style={{ marginTop: "2rem" }}>
                <h2>📁 Gestion des Catégories</h2>
                
                <div style={{ marginBottom: "1.5rem" }}>
                    <h3>Ajouter une catégorie</h3>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                        <input
                            className="input-field"
                            placeholder="Nom de la catégorie"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            style={{ flex: 2 }}
                        />
                        <input
                            className="input-field"
                            placeholder="Slug (optionnel)"
                            value={newCategory.slug}
                            onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                            style={{ flex: 1 }}
                        />
                        <button className="admin-btn btn-primary" onClick={addCategory}>
                            ➕ Ajouter
                        </button>
                    </div>
                </div>

                <div className="categories-list">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="category-item" style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "1rem",
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: "8px",
                            marginBottom: "0.5rem"
                        }}>
                            <div>
                                <strong>{cat.name}</strong>
                                <div style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
                                    Slug: {cat.slug}
                                </div>
                            </div>
                            <button 
                                className="admin-btn btn-danger"
                                onClick={() => removeCategory(idx)}
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>

                <button 
                    className="admin-btn btn-success"
                    onClick={handleSaveCategories}
                    style={{ marginTop: "1rem", width: "100%" }}
                >
                    💾 Sauvegarder les Catégories
                </button>
            </div>
        </div>
    );
}
