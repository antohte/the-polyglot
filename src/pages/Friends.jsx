// src/pages/Friends.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import "../styles/Friends.css";

export default function Friends() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(
        (u) =>
          u.fullNameLower?.includes(term) ||
          u.email?.toLowerCase().includes(term) ||
          u.licenseYear?.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  async function loadUsers() {
    try {
      const data = await api.users.getAll();
      const mapped = data.map(u => {
        const fullName = u.full_name || u.display_name || "Utilisateur";
        return {
          id: u.id,
          fullName,
          fullNameLower: fullName.toLowerCase(),
          email: u.email,
          licenseYear: u.license_year,
          photoUrl: u.photo_url || null
        };
      });
      // Sort by fullName
      mapped.sort((a, b) => a.fullName.localeCompare(b.fullName));

      setUsers(mapped);
      setFilteredUsers(mapped);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleUserClick(userId) {
    navigate(`/user/${userId}`);
  }

  if (!user) {
    return (
      <div className="container">
        <div className="alert-box">
          Vous devez être connecté pour voir les membres.
        </div>
      </div>
    );
  }

  return (
    <div className="container friends-container">
      <div className="friends-header">
        <h1 className="friends-title">
          <span className="icon">👥</span>
          Membres de la communauté
        </h1>
        <p className="friends-subtitle">
          Trouvez et connectez-vous avec d'autres étudiants
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Rechercher par nom, email ou année..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button
            className="clear-search"
            onClick={() => setSearchTerm("")}
            title="Effacer"
          >
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-friends">
          <div className="spinner"></div>
          Chargement des membres...
        </div>
      ) : (
        <>
          <div className="results-count">
            {filteredUsers.length} membre{filteredUsers.length > 1 ? "s" : ""} trouvé{filteredUsers.length > 1 ? "s" : ""}
          </div>

          <div className="users-grid">
            {filteredUsers.map((u) => {
              const initial = (u.fullName || u.email || "?").charAt(0).toUpperCase();
              const isCurrentUser = u.id === user.uid;

              return (
                <div
                  key={u.id}
                  className="user-card"
                  onClick={() => handleUserClick(u.id)}
                  style={{ cursor: "pointer" }}
                >
                  {isCurrentUser && (
                    <div className="current-user-badge">Vous</div>
                  )}

                  <div className="user-card-avatar">{initial}</div>

                  <div className="user-card-info">
                    <h3 className="user-card-name">
                      {u.fullName || "Utilisateur"}
                    </h3>
                    <p className="user-card-email">{u.email}</p>
                    {u.licenseYear && (
                      <span className="user-card-year">
                        📚 {u.licenseYear}
                      </span>
                    )}
                  </div>

                  <button
                    className="view-profile-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserClick(u.id);
                    }}
                  >
                    Voir le profil
                  </button>
                </div>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="no-results">
              <span className="no-results-icon">😔</span>
              <p>Aucun membre trouvé pour "{searchTerm}"</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
