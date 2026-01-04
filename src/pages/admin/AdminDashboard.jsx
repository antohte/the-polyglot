import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "../../firebase";
import "../../styles/Admin.css";

export default function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, posts: 0, events: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const usersColl = collection(db, "users");
                const postsColl = collection(db, "posts");
                const eventsColl = collection(db, "events");

                const [usersSnap, postsSnap, eventsSnap] = await Promise.all([
                    getCountFromServer(usersColl),
                    getCountFromServer(postsColl),
                    getCountFromServer(eventsColl),
                ]);

                setStats({
                    users: usersSnap.data().count,
                    posts: postsSnap.data().count,
                    events: eventsSnap.data().count,
                });
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
            <h1>Tableau de Bord</h1>
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Utilisateurs</h3>
                    <p className="stat-number">{stats.users}</p>
                </div>
                <div className="stat-card">
                    <h3>Posts</h3>
                    <p className="stat-number">{stats.posts}</p>
                </div>
                <div className="stat-card">
                    <h3>Événements</h3>
                    <p className="stat-number">{stats.events}</p>
                </div>
            </div>
        </div>
    );
}
