// src/pages/UserProfile.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import "../styles/UserProfile.css";

export default function UserProfile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState("none"); // none, pending_sent, pending_received, accepted

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
  const [actionLoading, setActionLoading] = useState(false);

  const isOwnProfile = user?.uid === userId;

  useEffect(() => {
    loadProfileAndStatus();
  }, [userId, user]);

  async function loadProfileAndStatus() {
    setLoading(true);
    try {
      // Parallel fetch
      const [profileData, statusData] = await Promise.all([
        api.users.get(userId).catch(() => null),
        !isOwnProfile ? api.users.getFriendStatus(user.uid, userId).catch(() => ({ status: 'none' })) : Promise.resolve({ status: 'none' })
      ]);

      if (profileData) {
        // Map fields
        setProfile({
          ...profileData,
          fullName: profileData.full_name || profileData.display_name,
          licenseYear: profileData.license_year,
          department: profileData.department,
          email: profileData.email,
          socials: profileData.social_links || {}
        });

        // Set socials state
        const s = profileData.social_links || {};
        setSocials({
          facebook: s.facebook || "",
          instagram: s.instagram || "",
          twitter: s.twitter || "",
          linkedin: s.linkedin || "",
          github: s.github || "",
          website: s.website || "",
        });
      }

      if (statusData) {
        setFriendStatus(statusData.status);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFriendAction(action) {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      if (action === 'add') {
        await api.users.sendFriendRequest(user.uid, userId);
        setFriendStatus('pending_sent');
      } else if (action === 'accept') {
        await api.users.acceptFriendRequest(user.uid, userId);
        setFriendStatus('accepted');
      } else if (action === 'remove' || action === 'cancel') {
        await api.users.removeFriend(user.uid, userId);
        setFriendStatus('none');
      }
    } catch (err) {
      console.error("Error friend action:", err);
      alert("Erreur lors de l'action");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSaveSocials() {
    if (!isOwnProfile) return;

    setSaving(true);
    try {
      await api.users.update(userId, {
        social_links: socials
      });

      setEditSocials(false);
      loadProfileAndStatus(); // reload to confirm
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

            {!isOwnProfile && (
              <div className="friend-actions" style={{ marginTop: '1rem' }}>
                {friendStatus === 'none' && (
                  <button className="btn-primary" onClick={() => handleFriendAction('add')} disabled={actionLoading} style={{ padding: '0.5rem 1rem', borderRadius: '6px' }}>
                    ➕ Ajouter en ami
                  </button>
                )}
                {friendStatus === 'pending_sent' && (
                  <button className="btn-ghost" onClick={() => handleFriendAction('cancel')} disabled={actionLoading} style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: '#e2e8f0' }}>
                    ⏳ Demande envoyée (Annuler)
                  </button>
                )}
                {friendStatus === 'pending_received' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-primary" onClick={() => handleFriendAction('accept')} disabled={actionLoading} style={{ padding: '0.5rem 1rem', borderRadius: '6px' }}>
                      ✅ Accepter
                    </button>
                    <button className="btn-ghost" onClick={() => handleFriendAction('remove')} disabled={actionLoading} style={{ padding: '0.5rem 1rem', borderRadius: '6px', color: 'red' }}>
                      ❌ Refuser
                    </button>
                  </div>
                )}
                {friendStatus === 'accepted' && (
                  <button className="btn-ghost" onClick={() => handleFriendAction('remove')} disabled={actionLoading} style={{ padding: '0.5rem 1rem', borderRadius: '6px', color: 'red', border: '1px solid currentColor' }}>
                    ❌ Retirer des amis
                  </button>
                )}
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
