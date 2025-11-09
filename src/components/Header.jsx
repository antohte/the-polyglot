// src/components/Header.jsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import useUserProfile from "../hooks/useUserProfile";
import { useEffect, useState } from "react";
import ProfileModal from "./ProfileModal";

export default function Header() {
  const { user, logout, signInGoogle } = useAuth();
  const { profile, loading } = useUserProfile(user?.uid);
  const [openProfile, setOpenProfile] = useState(false);
  const loc = useLocation();

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

  return (
    <header className="header header-centered">
      <div className="auth-actions">
        {user ? (
          <>
            <span className="user">
              {profile?.fullName || user.displayName || user.email}
            </span>
            <button className="btn" onClick={() => setOpenProfile(true)}>
              Profil
            </button>
            <button className="btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <button className="btn" onClick={signInGoogle}>Login</button>
        )}
      </div>

      <div className="logo big">THE<br/>Polyglot</div>

      <nav className="nav-under-logo">
        <Link className={navClass("/")} to="/">Accueil</Link>
        <Link className={navClass("/forum")} to="/forum">Forum</Link>
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
