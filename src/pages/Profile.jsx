// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
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
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
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

  // Friends & Requests
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (profile) {
      const names = (profile.fullName || "").split(" ");
      setFirstName(names[0] || "");
      setLastName(names.slice(1).join(" ") || "");
      setYear(profile.licenseYear || "L3");
      setBio(profile.bio || "");
      setLocation(profile.location || "");
      setInterests(profile.interests || "");
      setProfilePhoto(profile.profile_photo || profile.photo_url || "");
      setSocials({
        facebook: profile.socials?.facebook || "",
        instagram: profile.socials?.instagram || "",
        twitter: profile.socials?.twitter || "",
        linkedin: profile.socials?.linkedin || "",
        github: profile.socials?.github || "",
        website: profile.socials?.website || "",
      });

      loadFriendsAndRequests();
    }
  }, [user, profile, navigate]);

  async function loadFriendsAndRequests() {
    try {
      const [f, r] = await Promise.all([
        api.users.getFriends(user.uid),
        api.users.getPendingRequests(user.uid)
      ]);
      setFriends(f);
      setRequests(r);
    } catch (err) {
      console.error("Error loading friends:", err);
    }
  }

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim()) {
      alert("Merci de renseigner prénom et nom.");
      return;
    }

    if (bio.length > 500) {
      alert("La bio ne peut pas dépasser 500 caractères.");
      return;
    }

    setBusy(true);
    try {
      let uploadedPhotoUrl = profilePhoto;

      // Upload photo if a new file was selected
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);

        const uploadResponse = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          uploadedPhotoUrl = uploadData.url;
        }
      }

      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const payload = {
        full_name: fullName,
        display_name: fullName,
        license_year: year,
        bio: bio.trim(),
        location: location.trim(),
        interests: interests.trim(),
        profile_photo: uploadedPhotoUrl
      };

      await api.users.update(user.uid, payload);

      setEditMode(false);
      setSuccessMsg("Profil mis à jour avec succès !");
      setTimeout(() => setSuccessMsg(""), 3000);
      window.location.reload();
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
      await api.users.update(user.uid, {
        social_links: socials
      });

      setEditSocials(false);
      setSuccessMsg("Réseaux sociaux mis à jour avec succès !");
      setTimeout(() => setSuccessMsg(""), 3000);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la sauvegarde des réseaux sociaux.");
    } finally {
      setSavingSocials(false);
    }
  }

  async function handleAccept(requesterId) {
    try {
      await api.users.acceptFriendRequest(user.uid, requesterId);
      loadFriendsAndRequests();
    } catch (err) { alert("Erreur accept"); }
  }

  async function handleReject(requesterId) {
    try {
      await api.users.removeFriend(user.uid, requesterId);
      loadFriendsAndRequests();
    } catch (err) { alert("Erreur reject"); }
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La photo ne doit pas dépasser 5 MB.");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleRemoveFriend(friendId) {
    if (!window.confirm("Supprimer cet ami ?")) return;
    try {
      await api.users.removeFriend(user.uid, friendId);
      loadFriendsAndRequests();
    } catch (err) { alert("Erreur remove"); }
  }

  if (!user) return null;

  if (loading) {
    return (
      <div className="container">
        <div className="loading-profile">Chargement du profil...</div>
      </div>
    );
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

      {/* Requests Section */}
      {requests.length > 0 && (
        <div className="profile-section">
          <h2>📩 Demandes reçues</h2>
          <div className="requests-list">
            {requests.map(r => (
              <div key={r.id} className="request-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' }}>
                <div>
                  <strong>{r.full_name || r.display_name}</strong>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button className="btn btn-primary" onClick={() => handleAccept(r.id)}>Accepter</button>
                  <button className="btn btn-ghost" onClick={() => handleReject(r.id)} style={{ color: 'red' }}>Refuser</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends Section */}
      <div className="profile-section">
        <h2>👥 Mes Amis ({friends.length})</h2>
        {friends.length === 0 ? (
          <p>Vous n'avez pas encore d'amis.</p>
        ) : (
          <div className="friends-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
            {friends.map(f => (
              <div key={f.id} className="friend-card" style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold' }}>{f.full_name || f.display_name}</div>
                <button className="btn-ghost" onClick={() => navigate(`/user/${f.id}`)} style={{ fontSize: '0.8rem', marginTop: '5px' }}>Voir</button>
                <button className="btn-ghost" onClick={() => handleRemoveFriend(f.id)} style={{ fontSize: '0.8rem', color: 'red', marginTop: '5px' }}>Supprimer</button>
              </div>
            ))}
          </div>
        )}
      </div>

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

      {/* Section Photo de profil */}
      <div className="profile-section">
        <div className="section-header">
          <h2>📸 Photo de profil</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1rem' }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: photoPreview || profilePhoto ? `url(${photoPreview || profilePhoto}) center/cover` : 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            color: 'white',
            fontWeight: 'bold',
            border: '4px solid rgba(255,255,255,0.1)'
          }}>
            {!photoPreview && !profilePhoto && fullName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-block' }}>
              📷 Choisir une photo
            </label>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Format: JPG, PNG. Taille max: 5 MB
            </p>
          </div>
        </div>
      </div>

      {/* Section Bio */}
      <div className="profile-section">
        <div className="section-header">
          <h2>📝 Bio</h2>
          {!editMode && (
            <button className="btn btn-primary" onClick={() => setEditMode(true)}>
              ✏️ Modifier
            </button>
          )}
        </div>
        {editMode ? (
          <div className="form-group">
            <textarea
              className="ui-input"
              rows={5}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Parlez-nous de vous..."
              style={{ resize: 'vertical' }}
            />
            <div style={{ textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              {bio.length}/500 caractères
            </div>
          </div>
        ) : (
          <div className="profile-display">
            <p style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1' }}>
              {bio || "Aucune bio renseignée"}
            </p>
          </div>
        )}
      </div>

      {/* Section Localisation & Intérêts */}
      <div className="profile-section">
        <div className="section-header">
          <h2>🌍 Localisation & Intérêts</h2>
        </div>
        {editMode ? (
          <div>
            <div className="form-group">
              <label>📍 Localisation</label>
              <input
                className="ui-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Paris, France"
              />
            </div>
            <div className="form-group">
              <label>🏷️ Centres d'intérêt</label>
              <input
                className="ui-input"
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="Langues, Voyages, Musique..."
              />
              <small style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                Séparez par des virgules
              </small>
            </div>
          </div>
        ) : (
          <div className="profile-display">
            <div className="info-row">
              <label>📍 Localisation</label>
              <p>{location || "Non renseigné"}</p>
            </div>
            <div className="info-row">
              <label>🏷️ Centres d'intérêt</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {interests ? interests.split(',').map((interest, idx) => (
                  <span key={idx} style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: '#818cf8',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                  }}>
                    {interest.trim()}
                  </span>
                )) : <p>Non renseigné</p>}
              </div>
            </div>
          </div>
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
