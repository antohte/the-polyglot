// src/components/Header.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import useUserProfile from "../hooks/useUserProfile";
import { useEffect, useState } from "react";
import ProfileModal from "./ProfileModal";
import logoPolyglot from "../assets/logo_polyglot.jpg";
import "../styles/Header.css";

export default function Header() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const { profile, loading } = useUserProfile(user?.uid);
  const [openProfile, setOpenProfile] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();

  // Ouvre le profil AUTOMATIQUEMENT UNE SEULE FOIS si incomplet
  useEffect(() => {
    if (!user || loading) return;

    const uid = user.uid;
    const promptedKey = `profilePrompted:${uid}`;

    const complete =
      !!profile &&
      !!profile.firstName &&
      !!profile.lastName &&
      !!profile.licenseYear;

    if (!complete) {
      // pas encore complet → on ne le montre qu'une fois automatiquement
      if (!localStorage.getItem(promptedKey)) {
        setOpenProfile(true);
        localStorage.setItem(promptedKey, "1");
      }
    } else {
      // profil complet → on n'affiche plus automatiquement
      // (rien à faire, le flag "prompted" peut rester)
    }
  }, [user, profile, loading]);

  const navClass = (path) => `nav-link ${loc.pathname === path ? "active" : ""}`;

  const userInitial = user
    ? (profile?.fullName || user.displayName || user.email)?.charAt(0).toUpperCase() || "U"
    : null;

  return (
    <header className="header header-centered">
      <div className="auth-actions">
        {user ? (
          <div className="user-menu">
            <button
              className="user-info-btn"
              onClick={() => navigate("/profile")}
              title="Voir le profil"
            >
              <span className="user-avatar">{userInitial}</span>
              <span className="user-email">{profile?.fullName || user.displayName || user.email}</span>
            </button>
            <button className="btn btn-logout" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        ) : (
          <button className="btn btn-login" onClick={() => navigate("/login")}>
            🔐 Login
          </button>
        )}
      </div>

      <Link to="/" className="logo big">
        <img src={settings?.logo_url || logoPolyglot} alt="The Polyglot" style={{ height: '80px', width: 'auto' }} />
      </Link>

      <nav className="nav-under-logo">
        <Link className={navClass("/")} to="/">
          🏠 Accueil
        </Link>
        <Link className={navClass("/forum")} to="/forum">
          💬 Forum
        </Link>
        <Link className={navClass("/events")} to="/events">
          📅 Événements
        </Link>
        <Link className={navClass("/friends")} to="/friends">
          👥 Amis
        </Link>
      </nav>

      {/* Modal profil (ouverture manuelle ou auto une seule fois) */}
      <ProfileModal
        user={user}
        initialProfile={profile}
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        onSaved={() => setOpenProfile(false)}
      />
    </header>
  );
}
