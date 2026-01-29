import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/Admin.css";

export default function AdminLayout() {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navItems = [
        { label: "Dashboard", path: "/admin", icon: "📊" },
        { label: "Utilisateurs", path: "/admin/users", icon: "👥" },
        { label: "Posts", path: "/admin/posts", icon: "📝" },
        { label: "Événements", path: "/admin/events", icon: "📅" },
        { label: "Sondages", path: "/admin/polls", icon: "🗳️" },
        { label: "Catégories", path: "/admin/categories", icon: "📁" },
        { label: "Modération", path: "/admin/moderation", icon: "🚨" },
        { label: "Paramètres", path: "/admin/settings", icon: "⚙️" },
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>Admin Panel</h2>
                    <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            👨‍💻
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>{user?.full_name || 'Admin'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Super Admin</div>
                        </div>
                    </div>
                </div>
                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`admin-nav-link ${location.pathname === item.path ? "active" : ""}`}
                        >
                            <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="admin-sidebar-footer">
                    <Link to="/" className="back-home-btn">🏠 Retour au Site</Link>
                    <button onClick={logout} className="admin-logout-btn">🚪 Déconnexion</button>
                </div>
            </aside>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
}
