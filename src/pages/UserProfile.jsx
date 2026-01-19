import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthContext";
import "../styles/UserProfile.css";

export default function UserProfile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editSocials, setEditSocials] = useState(false);
  const [socials, setSocials] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    github: "",
    website: "",
  });
  const [saving, setSaving] = useState(false);

  const isOwnProfile = user?.uid === userId;

  useEffect(() => {
    loadProfile();
  }, [userId]);

  async function loadProfile() {
    try {
      const docRef = doc(db, "users", userId);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        setSocials({
          facebook: data.socials?.facebook || "",
          instagram: data.socials?.instagram || "",
          twitter: data.socials?.twitter || "",
          linkedin: data.socials?.linkedin || "",
          github: data.socials?.github || "",
          website: data.socials?.website || "",
        });
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Erreur lors du chargement du profil:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSocials() {
    if (!isOwnProfile) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, "users", userId);
      await updateDoc(docRef, {
        socials: socials,
        updatedAt: new Date(),
      });
      
      setEditSocials(false);
      await loadProfile();
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      alert("Erreur lors de la sauvegarde des réseaux sociaux");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading-profile">
          <div className="spinner"></div>
          Chargement du profil...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container">
        <div className="alert-box">
          Profil introuvable
        </div>
        <button className="btn-back" onClick={() => navigate("/friends")}>
          ← Retour aux membres
        </button>
      </div>
    );
  }

  const fullName = profile.fullName || "Utilisateur";
  const initial = fullName.charAt(0).toUpperCase();

  const socialLinks = [
    { key: "facebook", label: "Facebook", icon: "📘", url: socials.facebook },
    { key: "instagram", label: "Instagram", icon: "📷", url: socials.instagram },
    { key: "twitter", label: "Twitter", icon: "🐦", url: socials.twitter },
    { key: "linkedin", label: "LinkedIn", icon: "💼", url: socials.linkedin },
    { key: "github", label: "GitHub", icon: "💻", url: socials.github },
    { key: "website", label: "Site Web", icon: "🌐", url: socials.website },
  ];

  const activeSocials = socialLinks.filter((s) => s.url && s.url.trim() !== "");

  return (
    <div className="container user-profile-container">
      <button className="btn-back" onClick={() => navigate("/friends")}>
        ← Retour aux membres
      </button>

      {/* En-tête du profil */}
      <div className="user-profile-header">
        <div className="user-profile-card">
          <div className="user-profile-avatar">{initial}</div>
          <div className="user-profile-info">
            <h1 className="user-profile-name">{fullName}</h1>
            <p className="user-profile-email">{profile.email}</p>
            {profile.licenseYear && (
              <div className="user-profile-meta">
                <span className="meta-badge">
                  📚 Année: <strong>{profile.licenseYear}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Réseaux sociaux */}
      <div className="socials-section">
        <div className="socials-header">
          <h2 className="socials-title">
            <span className="icon">🔗</span>
            Réseaux sociaux
          </h2>
          {isOwnProfile && !editSocials && (
            <button
              className="btn-edit-socials"
              onClick={() => setEditSocials(true)}
            >
              ✏️ Modifier
            </button>
          )}
        </div>

        {editSocials && isOwnProfile ? (
          <div className="socials-edit-form">
            {socialLinks.map((social) => (
              <div key={social.key} className="social-input-group">
                <label className="social-label">
                  <span className="social-icon">{social.icon}</span>
                  {social.label}
                </label>
                <input
                  type="url"
                  placeholder={`https://...`}
                  value={socials[social.key]}
                  onChange={(e) =>
                    setSocials({ ...socials, [social.key]: e.target.value })
                  }
                  className="social-input"
                />
              </div>
            ))}

            <div className="socials-actions">
              <button
                className="btn-save-socials"
                onClick={handleSaveSocials}
                disabled={saving}
              >
                {saving ? "Sauvegarde..." : "💾 Enregistrer"}
              </button>
              <button
                className="btn-cancel-socials"
                onClick={() => {
                  setEditSocials(false);
                  setSocials({
                    facebook: profile.socials?.facebook || "",
                    instagram: profile.socials?.instagram || "",
                    twitter: profile.socials?.twitter || "",
                    linkedin: profile.socials?.linkedin || "",
                    github: profile.socials?.github || "",
                    website: profile.socials?.website || "",
                  });
                }}
                disabled={saving}
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeSocials.length > 0 ? (
              <div className="socials-list">
                {activeSocials.map((social) => (
                  <a
                    key={social.key}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    <span className="social-icon">{social.icon}</span>
                    <span className="social-name">{social.label}</span>
                    <span className="external-icon">↗</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="no-socials">
                {isOwnProfile
                  ? "Vous n'avez pas encore ajouté de réseaux sociaux"
                  : "Aucun réseau social ajouté"}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
