import { useEffect, useState } from "react";
import { api } from "../../api/client";
import "../../styles/Admin.css";
import AdminModal from "../../components/AdminModal";

import { useAuth } from "../../auth/AuthContext";

export default function AdminUsers() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '' });
    const [createError, setCreateError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await api.users.getAll();
            setUsers(data);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleBan = async (user) => {
        if (!window.confirm(`Voulez-vous vraiment ${user.is_banned ? "débannir" : "bannir"} ${user.email} ?`)) return;

        try {
            await api.users.update(user.id, { is_banned: !user.is_banned ? 1 : 0 });
            setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, is_banned: !user.is_banned } : u))
            );
        } catch (err) {
            console.error("Error toggling ban:", err);
            alert("Erreur lors de la mise à jour du statut.");
        }
    };

    const changeRole = async (user, newRole) => {
        // Confirmation is implicit in the UI interaction usually, but let's keep it safe
        if (!window.confirm(`Changer le rôle de ${user.email} en "${newRole}" ?`)) return;

        try {
            // Optimistic update
            setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
            await api.users.update(user.id, { role: newRole });
        } catch (err) {
            console.error("Error changing role:", err);
            alert("Échec de la mise à jour du rôle");
            fetchUsers(); // Revert on error
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreateError('');
        try {
            // We use the existing signup API but ignore the login token
            await api.auth.signup(newUser);
            alert("Utilisateur créé avec succès !");
            setIsCreateOpen(false);
            setNewUser({ email: '', password: '', full_name: '' });
            fetchUsers(); // Refresh list
        } catch (err) {
            setCreateError(err.message || "Erreur lors de la création");
        }
    };

    if (loading) return <div className="admin-loading">Chargement des données...</div>;

    // Filtering
    const filteredUsers = users.filter(user => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase();
        return (
            user.email?.toLowerCase().includes(search) ||
            user.full_name?.toLowerCase().includes(search) ||
            user.display_name?.toLowerCase().includes(search) ||
            user.role?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="admin-page">
            <div className="section-header">
                <div>
                    <h1>Gestion des Utilisateurs</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Gérez les membres, leurs rôles et accès.</p>
                </div>
                <button className="admin-btn btn-primary" onClick={() => setIsCreateOpen(true)} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                    + Nouvel Utilisateur
                </button>
            </div>

            {/* Premium Search Bar */}
            <div className="content-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: "1.5rem" }}>🔍</span>
                <input
                    type="text"
                    placeholder="Rechercher par nom, email, rôle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "white",
                        fontSize: "1.1rem",
                        width: "100%",
                        outline: "none"
                    }}
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm("")} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        ✕
                    </button>
                )}
            </div>

            {/* Users Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Utilisateur</th>
                            <th>Rôle</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                                    {searchTerm ? "Aucun résultat trouvé pour votre recherche." : "Aucun utilisateur inscrit."}
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                background: user.photo_url ? `url(${user.photo_url}) center/cover` : 'linear-gradient(135deg, #6366f1, #ec4899)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontWeight: 'bold'
                                            }}>
                                                {!user.photo_url && (user.full_name?.charAt(0) || user.email.charAt(0)).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: "600", color: '#f1f5f9' }}>{user.full_name || "Sans nom"}</div>
                                                <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <select
                                            value={user.role || 'user'}
                                            onChange={(e) => changeRole(user, e.target.value)}
                                            disabled={currentUser?.role !== 'admin'}
                                            style={{
                                                background: 'rgba(15, 23, 42, 0.5)',
                                                color: user.role === 'admin' ? '#fca5a5' : user.role === 'organizer' ? '#c4b5fd' : '#cbd5e1',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '6px',
                                                fontWeight: '600',
                                                fontSize: '0.85rem',
                                                cursor: currentUser?.role === 'admin' ? 'pointer' : 'not-allowed',
                                                opacity: currentUser?.role === 'admin' ? 1 : 0.6
                                            }}
                                        >
                                            <option value="user">User</option>
                                            <option value="organizer">Organizer</option>
                                            <option value="moderator">Moderator</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        {user.is_banned ? (
                                            <span className="status-badge status-banned">BANNIS</span>
                                        ) : (
                                            <span className="status-badge status-success">ACTIF</span>
                                        )}
                                    </td>
                                    <td>
                                        {currentUser?.role === 'admin' && (
                                            <button
                                                className={`admin-btn ${user.is_banned ? 'btn-success' : 'btn-danger'}`}
                                                onClick={() => toggleBan(user)}
                                            >
                                                {user.is_banned ? "Débannir" : "Bannir"}
                                            </button>
                                        )}
                                        <a href={`/user/${user.id}`} target="_blank" rel="noreferrer" className="admin-btn btn-primary" style={{ textDecoration: 'none' }}>
                                            Voir
                                        </a>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            <AdminModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Créer un nouvel utilisateur"
                actions={
                    <>
                        <button onClick={() => setIsCreateOpen(false)} className="back-home-btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>Annuler</button>
                        <button onClick={handleCreateUser} className="admin-btn btn-primary">Créer l'utilisateur</button>
                    </>
                }
            >
                <form onSubmit={handleCreateUser} className="settings-grid">
                    {createError && (
                        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', borderRadius: '8px', marginBottom: '1rem' }}>
                            {createError}
                        </div>
                    )}
                    <label>
                        Nom Complet
                        <input
                            type="text"
                            className="input-field"
                            required
                            value={newUser.full_name}
                            onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                            style={{
                                background: 'rgba(15, 23, 42, 0.5)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                color: 'white'
                            }}
                        />
                    </label>
                    <label>
                        Email
                        <input
                            type="email"
                            className="input-field"
                            required
                            value={newUser.email}
                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                            style={{
                                background: 'rgba(15, 23, 42, 0.5)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                color: 'white'
                            }}
                        />
                    </label>
                    <label>
                        Mot de passe
                        <input
                            type="password"
                            className="input-field"
                            required
                            value={newUser.password}
                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                            style={{
                                background: 'rgba(15, 23, 42, 0.5)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                color: 'white'
                            }}
                        />
                    </label>
                </form>
            </AdminModal>
        </div>
    );
}
