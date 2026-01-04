import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "../../styles/Admin.css";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="admin-loading">Chargement des utilisateurs...</div>;

    return (
        <div className="admin-page">
            <h1>Gestion des Utilisateurs</h1>
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
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div style={{ fontWeight: "bold" }}>{user.fullName || user.displayName || "Sans nom"}</div>
                                    <div style={{ fontSize: "0.85em", color: "#94a3b8" }}>{user.email}</div>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.role === 'admin' ? 'status-admin' : 'status-user'}`}>
                                        {user.role || 'user'}
                                    </span>
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
                                    <button className="admin-btn btn-primary" onClick={() => toggleAdmin(user)}>
                                        {user.role === 'admin' ? "Demote" : "Promote"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
