import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/Admin.css";

export default function AdminLayout() {
    const { logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { label: "Dashboard", path: "/admin", icon: "📊" },
        { label: "Utilisateurs", path: "/admin/users", icon: "👥" },
        { label: "Posts", path: "/admin/posts", icon: "📝" },
        { label: "Événements", path: "/admin/events", icon: "📅" },
        { label: "Sondages", path: "/admin/polls", icon: "📊" },
        { label: "Catégories", path: "/admin/categories", icon: "📁" },
        { label: "Paramètres", path: "/admin/settings", icon: "⚙️" },
        { label: "Modération", path: "/admin/moderation", icon: "🚨" },
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>Admin Panel</h2>
                </div>
                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`admin-nav-link ${location.pathname === item.path ? "active" : ""}`}
                        >
                            <span style={{ marginRight: "0.5rem" }}>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="admin-sidebar-footer">
                    <Link to="/" className="back-home-btn">🏠 Retour au Site</Link>
                    <button onClick={logout} className="admin-logout-btn">🚪 Logout</button>
                </div>
            </aside>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
}
