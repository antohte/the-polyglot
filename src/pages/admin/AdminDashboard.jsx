import { useEffect, useState } from "react";
import { collection, getCountFromServer, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
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
                const usersColl = collection(db, "users");
                const postsColl = collection(db, "posts");
                const eventsColl = collection(db, "events");
                const pollsColl = collection(db, "polls");

                const [usersSnap, postsSnap, eventsSnap, pollsSnap] = await Promise.all([
                    getCountFromServer(usersColl),
                    getCountFromServer(postsColl),
                    getCountFromServer(eventsColl),
                    getCountFromServer(pollsColl),
                ]);

                setStats({
                    users: usersSnap.data().count,
                    posts: postsSnap.data().count,
                    events: eventsSnap.data().count,
                    polls: pollsSnap.data().count,
                });

                // Fetch top posts by likes
                const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(100));
                const postsData = await getDocs(postsQuery);
                const posts = postsData.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Sort by likes and get top 5
                const sortedByLikes = posts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)).slice(0, 5);
                setTopPosts(sortedByLikes);

                // Category stats
                const categoryCount = {};
                posts.forEach(post => {
                    const cat = post.category || "Sans catégorie";
                    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
                });
                const catStats = Object.entries(categoryCount)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
                setCategoryStats(catStats);

                // Recent users
                const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5));
                const usersData = await getDocs(usersQuery);
                setRecentUsers(usersData.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Recent posts
                const recentPostsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(5));
                const recentPostsData = await getDocs(recentPostsQuery);
                setRecentPosts(recentPostsData.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (err) {
                console.error("Error fetching admin stats:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return <div className="admin-loading">Chargement des stats...</div>;

    return (
        <div className="admin-dashboard-page">
            <h1>📊 Tableau de Bord</h1>
            
            {/* KPIs */}
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(139, 92, 246, 0.3)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
                    <h3 style={{ margin: "0 0 0.5rem 0", color: "#c4b5fd" }}>Utilisateurs</h3>
                    <p className="stat-number" style={{ fontSize: "2.5rem", fontWeight: "bold", margin: 0 }}>{stats.users}</p>
                </div>
                <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(34, 197, 94, 0.3)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📝</div>
                    <h3 style={{ margin: "0 0 0.5rem 0", color: "#86efac" }}>Posts</h3>
                    <p className="stat-number" style={{ fontSize: "2.5rem", fontWeight: "bold", margin: 0 }}>{stats.posts}</p>
                </div>
                <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(251, 146, 60, 0.2) 100%)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(249, 115, 22, 0.3)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📅</div>
                    <h3 style={{ margin: "0 0 0.5rem 0", color: "#fdba74" }}>Événements</h3>
                    <p className="stat-number" style={{ fontSize: "2.5rem", fontWeight: "bold", margin: 0 }}>{stats.events}</p>
                </div>
                <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(219, 39, 119, 0.2) 100%)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(236, 72, 153, 0.3)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</div>
                    <h3 style={{ margin: "0 0 0.5rem 0", color: "#f9a8d4" }}>Sondages</h3>
                    <p className="stat-number" style={{ fontSize: "2.5rem", fontWeight: "bold", margin: 0 }}>{stats.polls}</p>
                </div>
            </div>

            {/* Engagement Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                {/* Top Posts */}
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <h2 style={{ marginTop: 0, color: "#c4b5fd" }}>🔥 Posts les Plus Populaires</h2>
                    {topPosts.length === 0 ? (
                        <p style={{ color: "#94a3b8" }}>Aucun post pour le moment</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {topPosts.map((post, idx) => (
                                <div key={post.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#8b5cf6" }}>{idx + 1}</div>
                                    <div style={{ flex: 1, overflow: "hidden" }}>
                                        <Link to={`/post/${post.id}`} style={{ color: "inherit", textDecoration: "none", fontWeight: "500", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {post.title}
                                        </Link>
                                        <div style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
                                            ❤️ {post.likes?.length || 0} likes
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category Stats */}
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <h2 style={{ marginTop: 0, color: "#c4b5fd" }}>📁 Catégories les Plus Actives</h2>
                    {categoryStats.length === 0 ? (
                        <p style={{ color: "#94a3b8" }}>Aucune catégorie</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {categoryStats.map((cat, idx) => (
                                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                                    <span style={{ fontWeight: "500" }}>{cat.name}</span>
                                    <span style={{ background: "rgba(139, 92, 246, 0.3)", padding: "0.25rem 0.75rem", borderRadius: "12px", fontSize: "0.875rem", fontWeight: "bold" }}>
                                        {cat.count} posts
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {/* Recent Users */}
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <h2 style={{ marginTop: 0, color: "#c4b5fd" }}>👋 Dernières Inscriptions</h2>
                    {recentUsers.length === 0 ? (
                        <p style={{ color: "#94a3b8" }}>Aucune inscription récente</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {recentUsers.map(user => (
                                <div key={user.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #8b5cf6, #ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
                                        👤
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: "500" }}>{user.fullName || user.displayName || "Sans nom"}</div>
                                        <div style={{ fontSize: "0.875rem", color: "#94a3b8" }}>{user.email}</div>
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                        {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : "—"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Posts */}
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <h2 style={{ marginTop: 0, color: "#c4b5fd" }}>📰 Derniers Posts</h2>
                    {recentPosts.length === 0 ? (
                        <p style={{ color: "#94a3b8" }}>Aucun post récent</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {recentPosts.map(post => (
                                <div key={post.id} style={{ padding: "0.75rem", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                                    <Link to={`/post/${post.id}`} style={{ color: "inherit", textDecoration: "none", fontWeight: "500", display: "block" }}>
                                        {post.title}
                                    </Link>
                                    <div style={{ fontSize: "0.875rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                                        Par {post.authorName} • {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : "—"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
