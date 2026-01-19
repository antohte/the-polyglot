// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthContext";
import useUserProfile from "../hooks/useUserProfile";
import "../styles/Profile.css";

const YEARS = ["L1", "L2", "L3", "M1", "M2"];

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { profile, loading } = useUserProfile(user?.uid);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [year, setYear] = useState("L3");
  const [busy, setBusy] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [editSocials, setEditSocials] = useState(false);
  const [socials, setSocials] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    github: "",
    website: "",
  });
  const [savingSocials, setSavingSocials] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setYear(profile.licenseYear || "L3");
      setSocials({
        facebook: profile.socials?.facebook || "",
        instagram: profile.socials?.instagram || "",
        twitter: profile.socials?.twitter || "",
        linkedin: profile.socials?.linkedin || "",
        github: profile.socials?.github || "",
        website: profile.socials?.website || "",
      });
    }
  }, [user, profile, navigate]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="container">
        <div className="loading-profile">Chargement du profil...</div>
      </div>
    );
  }

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim()) {
      alert("Merci de renseigner prénom et nom.");
      return;
    }

    setBusy(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const ref = doc(db, "users", user.uid);
      const payload = {
        uid: user.uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
        fullNameLower: fullName.toLowerCase(),
        licenseYear: year,
        updatedAt: new Date(),
      };
      await setDoc(ref, payload, { merge: true });
      await updateProfile(user, { displayName: fullName }).catch(() => { });

      setEditMode(false);
      setSuccessMsg("Profil mis à jour avec succès !");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'enregistrement du profil.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveSocials() {
    setSavingSocials(true);
    try {
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, {
        socials: socials,
        updatedAt: new Date(),
      }, { merge: true });
      
      setEditSocials(false);
      setSuccessMsg("Réseaux sociaux mis à jour avec succès !");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la sauvegarde des réseaux sociaux.");
    } finally {
      setSavingSocials(false);
    }
  }

  const fullName = profile?.fullName || user.displayName || user.email;

  return (
    <div className="container profile-container">
      {/* En-tête profil */}
      <div className="profile-header">
        <div className="profile-card">
          <div className="profile-avatar">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{fullName}</h1>
            <p className="profile-email">{user.email}</p>
            <div className="profile-meta">
              <span className="meta-badge">
                📚 Année: <strong>{year}</strong>
              </span>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate(`/user/${user.uid}`)}
              style={{ marginTop: "1rem" }}
            >
              👁️ Voir mon profil public
            </button>
          </div>
        </div>
      </div>

      {/* Message de succès */}
      {successMsg && <div className="success-message">{successMsg}</div>}

      {/* Section modifier le profil */}
      <div className="profile-section">
        <div className="section-header">
          <h2>Informations personnelles</h2>
          {!editMode && (
            <button className="btn btn-primary" onClick={() => setEditMode(true)}>
              ✏️ Modifier
            </button>
          )}
        </div>

        {!editMode ? (
          <div className="profile-display">
            <div className="info-row">
              <label>Prénom</label>
              <p>{firstName || "Non renseigné"}</p>
            </div>
            <div className="info-row">
              <label>Nom</label>
              <p>{lastName || "Non renseigné"}</p>
            </div>
            <div className="info-row">
              <label>Année de licence</label>
              <p>{year}</p>
            </div>
            <div className="info-row">
              <label>Email</label>
              <p>{user.email}</p>
            </div>
          </div>
        ) : (
          <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="firstName">Prénom</label>
              <input
                id="firstName"
                className="ui-input"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Votre prénom"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Nom</label>
              <input
                id="lastName"
                className="ui-input"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Votre nom"
              />
            </div>

            <div className="form-group">
              <label htmlFor="year">Année de licence</label>
              <select
                id="year"
                className="ui-select"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setEditMode(false)}
                disabled={busy}
              >
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={busy}
              >
                {busy ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Section Réseaux sociaux */}
      <div className="profile-section">
        <div className="section-header">
          <h2>🔗 Réseaux sociaux</h2>
          {!editSocials && (
            <button className="btn btn-primary" onClick={() => setEditSocials(true)}>
              ✏️ Modifier
            </button>
          )}
        </div>

        {editSocials ? (
          <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label>📘 Facebook</label>
              <input
                className="ui-input"
                type="url"
                placeholder="https://facebook.com/..."
                value={socials.facebook}
                onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>📷 Instagram</label>
              <input
                className="ui-input"
                type="url"
                placeholder="https://instagram.com/..."
                value={socials.instagram}
                onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>🐦 Twitter</label>
              <input
                className="ui-input"
                type="url"
                placeholder="https://twitter.com/..."
                value={socials.twitter}
                onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>💼 LinkedIn</label>
              <input
                className="ui-input"
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={socials.linkedin}
                onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>💻 GitHub</label>
              <input
                className="ui-input"
                type="url"
                placeholder="https://github.com/..."
                value={socials.github}
                onChange={(e) => setSocials({ ...socials, github: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>🌐 Site Web</label>
              <input
                className="ui-input"
                type="url"
                placeholder="https://..."
                value={socials.website}
                onChange={(e) => setSocials({ ...socials, website: e.target.value })}
              />
            </div>

            <div className="form-actions">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setEditSocials(false);
                  setSocials({
                    facebook: profile?.socials?.facebook || "",
                    instagram: profile?.socials?.instagram || "",
                    twitter: profile?.socials?.twitter || "",
                    linkedin: profile?.socials?.linkedin || "",
                    github: profile?.socials?.github || "",
                    website: profile?.socials?.website || "",
                  });
                }}
                disabled={savingSocials}
              >
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveSocials}
                disabled={savingSocials}
              >
                {savingSocials ? "Enregistrement..." : "💾 Enregistrer"}
              </button>
            </div>
          </form>
        ) : (
          <div className="socials-display">
            {[
              { key: "facebook", label: "Facebook", icon: "📘" },
              { key: "instagram", label: "Instagram", icon: "📷" },
              { key: "twitter", label: "Twitter", icon: "🐦" },
              { key: "linkedin", label: "LinkedIn", icon: "💼" },
              { key: "github", label: "GitHub", icon: "💻" },
              { key: "website", label: "Site Web", icon: "🌐" },
            ].map((social) => {
              const url = socials[social.key];
              return (
                <div key={social.key} className="social-item">
                  <span className="social-icon">{social.icon}</span>
                  <span className="social-name">{social.label}:</span>
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="social-link-text">
                      {url}
                    </a>
                  ) : (
                    <span className="social-empty">Non renseigné</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section compte et sécurité */}
      <div className="profile-section">
        <h2>Compte et sécurité</h2>
        <div className="security-info">
          <p>Connecté avec: <strong>{user.email}</strong></p>
          <p>Identifiant: <code>{user.uid}</code></p>
        </div>
        <button className="btn btn-logout" onClick={logout}>
          🚪 Se déconnecter
        </button>
      </div>

      {/* Section aide */}
      <div className="profile-section info-section">
        <h2>À propos de votre profil</h2>
        <div className="info-box">
          <p>
            ✨ <strong>Complétez votre profil</strong> pour que les autres puissent mieux vous connaître sur le forum.
          </p>
          <p>
            👥 <strong>Votre nom</strong> s'affichera sur tous vos posts et commentaires.
          </p>
          <p>
            🎓 <strong>Votre année</strong> vous permet de vous regrouper avec d'autres étudiants du même niveau.
          </p>
        </div>
      </div>
    </div>
  );
}
