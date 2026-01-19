import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "../../styles/Admin.css";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const snap = await getDocs(collection(db, "users"));
            const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setUsers(data);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleBan = async (user) => {
        if (!window.confirm(`Are you sure you want to ${user.isBanned ? "unban" : "ban"} ${user.email}?`)) return;

        try {
            const ref = doc(db, "users", user.id);
            await updateDoc(ref, { isBanned: !user.isBanned });
            setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, isBanned: !u.isBanned } : u))
            );
        } catch (err) {
            console.error("Error toggling ban:", err);
            alert("Failed to update user status");
        }
    };

    const toggleAdmin = async (user) => {
        const isNowAdmin = user.role !== "admin";
        if (!window.confirm(`Make ${user.email} ${isNowAdmin ? "ADMIN" : "USER"}?`)) return;

        try {
            const ref = doc(db, "users", user.id);
            const newRole = isNowAdmin ? "admin" : "user";
            await updateDoc(ref, { role: newRole });
            setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
            );
        } catch (err) {
            console.error("Error changing role:", err);
            alert("Failed to update role");
        }
    };

    const changeRole = async (user, newRole) => {
        if (!window.confirm(`Changer le rôle de ${user.email} en "${newRole}"?`)) return;

        try {
            const ref = doc(db, "users", user.id);
            await updateDoc(ref, { role: newRole });
            setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
            );
        } catch (err) {
            console.error("Error changing role:", err);
            alert("Échec de la mise à jour du rôle");
        }
    };

    if (loading) return <div className="admin-loading">Chargement des utilisateurs...</div>;

    // Filtrage des utilisateurs
    const filteredUsers = users.filter(user => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase();
        return (
            user.email?.toLowerCase().includes(search) ||
            user.fullName?.toLowerCase().includes(search) ||
            user.displayName?.toLowerCase().includes(search) ||
            user.role?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="admin-page">
            <h1>Gestion des Utilisateurs</h1>
            
            <div className="search-container" style={{
                marginBottom: "2rem",
                padding: "1.5rem",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
                borderRadius: "16px",
                border: "1px solid rgba(139, 92, 246, 0.2)",
                backdropFilter: "blur(10px)"
            }}>
                <div style={{ position: "relative" }}>
                    <span style={{
                        position: "absolute",
                        left: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "1.25rem",
                        color: "#a78bfa"
                    }}>🔍</span>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Rechercher par nom, email ou rôle..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            paddingLeft: "3rem",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(139, 92, 246, 0.3)",
                            borderRadius: "12px",
                            fontSize: "1rem",
                            transition: "all 0.3s ease"
                        }}
                    />
                </div>
                {searchTerm && (
                    <div style={{
                        marginTop: "0.75rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <p style={{ color: "#c4b5fd", fontSize: "0.875rem", margin: 0 }}>
                            ✨ {filteredUsers.length} résultat(s) sur {users.length} utilisateur(s)
                        </p>
                        <button
                            onClick={() => setSearchTerm("")}
                            style={{
                                background: "rgba(139, 92, 246, 0.2)",
                                border: "none",
                                color: "#c4b5fd",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "6px",
                                fontSize: "0.875rem",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                        >
                            ✕ Effacer
                        </button>
                    </div>
                )}
            </div>
            
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Email / Nom</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                                    {searchTerm ? "❌ Aucun utilisateur ne correspond à votre recherche" : "Aucun utilisateur disponible"}
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div style={{ fontWeight: "bold" }}>{user.fullName || user.displayName || "Sans nom"}</div>
                                    <div style={{ fontSize: "0.85em", color: "#94a3b8" }}>{user.email}</div>
                                </td>
                                <td>
                                    <select 
                                        value={user.role || 'user'}
                                        onChange={(e) => changeRole(user, e.target.value)}
                                        style={{
                                            background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 
                                                        user.role === 'organizer' ? 'rgba(102, 126, 234, 0.2)' : 
                                                        'rgba(148, 163, 184, 0.2)',
                                            color: user.role === 'admin' ? '#fca5a5' : 
                                                   user.role === 'organizer' ? '#c4b5fd' : 
                                                   '#cbd5e1',
                                            border: '1px solid',
                                            borderColor: user.role === 'admin' ? 'rgba(239, 68, 68, 0.3)' : 
                                                        user.role === 'organizer' ? 'rgba(102, 126, 234, 0.3)' : 
                                                        'rgba(148, 163, 184, 0.3)',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            fontSize: '0.875rem',
                                            cursor: 'pointer',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        <option value="user">👤 User</option>
                                        <option value="organizer">🎯 Organizer</option>
                                        <option value="admin">👑 Admin</option>
                                    </select>
                                </td>
                                <td>
                                    {user.isBanned ? (
                                        <span className="status-badge status-banned">BANNED</span>
                                    ) : (
                                        <span className="status-badge" style={{ background: "rgba(34, 197, 94, 0.2)", color: "#86efac" }}>Active</span>
                                    )}
                                </td>
                                <td>
                                    <button className="admin-btn btn-danger" onClick={() => toggleBan(user)}>
                                        {user.isBanned ? "Unban" : "Ban"}
                                    </button>
                                </td>
                            </tr>
                        ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
