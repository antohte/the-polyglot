import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import "../../styles/Admin.css";

export default function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, posts: 0, events: 0, polls: 0 });
    const [loading, setLoading] = useState(true);
    const [topPosts, setTopPosts] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await api.stats.get();
                setStats(data.stats);
                setTopPosts(data.topPosts || []);
                setCategoryStats(data.categoryStats || []);
                setRecentUsers(data.recentUsers || []);
                setRecentPosts(data.recentPosts || []);
            } catch (err) {
                console.error("Error fetching admin stats:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return <div className="admin-loading">Chargement des données...</div>;

    const quickActions = [
        { label: "Nouvel Utilisateur", path: "/admin/users", icon: "👤", color: "blue" },
        { label: "Nouvelle Annonce", path: "/admin/posts", icon: "📢", color: "purple" },
        { label: "Maintenance", path: "/admin/settings", icon: "🔧", color: "orange" },
    ];

    return (
        <div className="admin-dashboard-page">
            <div className="section-header">
                <div>
                    <h1>Tableau de Bord</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Bienvenue dans le centre de contrôle.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ padding: '0.5rem 1rem', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', display: 'inline-block' }}></span>
                        Système Opérationnel
                    </div>
                </div>
            </div>

            {/* Hero Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: '0.05' }}>👥</div>
                    <h3>Utilisateurs</h3>
                    <p className="stat-number">{stats.users}</p>
                    <div style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                        Inscrits sur la plateforme
                    </div>
                </div>
                <div className="stat-card">
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: '0.05' }}>📝</div>
                    <h3>Posts Publiés</h3>
                    <p className="stat-number">{stats.posts}</p>
                    <div style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                        Articles et forums
                    </div>
                </div>
                <div className="stat-card">
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: '0.05' }}>📅</div>
                    <h3>Événements</h3>
                    <p className="stat-number">{stats.events}</p>
                    <div style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                        À venir et passés
                    </div>
                </div>
                <div className="stat-card">
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: '0.05' }}>📊</div>
                    <h3>Sondages Actifs</h3>
                    <p className="stat-number">{stats.polls}</p>
                    <div style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                        Engagement communautaire
                    </div>
                </div>
            </div>

            {/* Grid Layout for details */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>

                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Quick Actions */}
                    <div className="content-card">
                        <h2 style={{ marginTop: 0, color: "#f8fafc", fontSize: '1.25rem', marginBottom: '1.5rem' }}>⚡ Actions Rapides</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                            {quickActions.map((action, idx) => (
                                <Link key={idx} to={action.path} style={{
                                    textDecoration: 'none',
                                    background: 'rgba(255,255,255,0.03)',
                                    padding: '1.5rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem',
                                    transition: 'all 0.3s'
                                }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <div style={{ fontSize: '2rem' }}>{action.icon}</div>
                                    <div style={{ color: '#e2e8f0', fontWeight: '600' }}>{action.label}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Posts */}
                    <div className="content-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, color: "#f8fafc", fontSize: '1.25rem' }}>📰 Activité Récente</h2>
                            <Link to="/admin/posts" style={{ color: '#818cf8', textDecoration: 'none', fontSize: '0.9rem' }}>Voir tout →</Link>
                        </div>
                        {recentPosts.length === 0 ? (
                            <p style={{ color: "#94a3b8" }}>Aucun post récent</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {recentPosts.map((post, idx) => (
                                    <div key={post.id} style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "1rem",
                                        background: "rgba(255,255,255,0.02)",
                                        borderRadius: "12px",
                                        border: "1px solid rgba(255,255,255,0.05)"
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '40px', height: '40px',
                                                borderRadius: '10px',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                color: '#818cf8',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.2rem', fontWeight: 'bold'
                                            }}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <Link to={`/post/${post.id}`} style={{ color: "#f1f5f9", textDecoration: "none", fontWeight: "600", display: "block" }}>
                                                    {post.title}
                                                </Link>
                                                <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                                                    Par {post.authorName || 'Inconnu'} • {post.created_at ? new Date(post.created_at).toLocaleDateString() : "—"}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="status-badge status-success">Publié</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (Sidebar-ish) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* New Users */}
                    <div className="content-card">
                        <h2 style={{ marginTop: 0, color: "#f8fafc", fontSize: '1.25rem', marginBottom: '1.5rem' }}>👋 Nouveaux Membres</h2>
                        {recentUsers.length === 0 ? (
                            <p style={{ color: "#94a3b8" }}>Aucune inscription récente</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {recentUsers.slice(0, 5).map(user => (
                                    <div key={user.id} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #f472b6, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", color: 'white', fontWeight: 'bold' }}>
                                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontWeight: "600", color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.full_name || 'Utilisateur'}</div>
                                            <div style={{ fontSize: "0.8rem", color: "#94a3b8", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <Link to="/admin/users" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Gérer les utilisateurs</Link>
                        </div>
                    </div>

                    {/* Category Stats */}
                    <div className="content-card">
                        <h2 style={{ marginTop: 0, color: "#f8fafc", fontSize: '1.25rem', marginBottom: '1.5rem' }}>🔥 Tendances</h2>
                        {categoryStats.length === 0 ? (
                            <p style={{ color: "#94a3b8" }}>Aucune donnée</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {categoryStats.slice(0, 4).map((cat, idx) => (
                                    <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                                        <span style={{ fontWeight: "500", color: '#cbd5e1' }}>{cat.name}</span>
                                        <span style={{ color: '#818cf8', fontWeight: "bold" }}>
                                            {cat.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <Link to="/admin/categories" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Voir toutes les catégories</Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
