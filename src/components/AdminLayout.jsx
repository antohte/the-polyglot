import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/Admin.css";

export default function AdminLayout() {
    const { logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { label: "Dashboard", path: "/admin" },
        { label: "Utilisateurs", path: "/admin/users" },
        { label: "Posts", path: "/admin/posts" },
        { label: "Événements", path: "/admin/events" },
        { label: "Sondages", path: "/admin/polls" },
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
