import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "../../styles/Admin.css";
import { Link } from "react-router-dom";

export default function AdminPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const snap = await getDocs(collection(db, "posts"));
            const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            // Tri par date décroissante si possible, sinon tel quel
            data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setPosts(data);
        } catch (err) {
            console.error("Error fetching posts:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("Supprimer ce post définitivement ?")) return;

        try {
            await deleteDoc(doc(db, "posts", postId));
            setPosts((prev) => prev.filter((p) => p.id !== postId));
        } catch (err) {
            console.error("Error deleting post:", err);
            alert("Erreur lors de la suppression");
        }
    };

    const togglePin = async (post) => {
        try {
            const ref = doc(db, "posts", post.id);
            await updateDoc(ref, { isPinned: !post.isPinned });
            setPosts((prev) =>
                prev.map((p) => (p.id === post.id ? { ...p, isPinned: !p.isPinned } : p))
            );
        } catch (err) {
            console.error("Error pinning post:", err);
        }
    };

    if (loading) return <div className="admin-loading">Chargement des posts...</div>;

    // Filtrage des posts
    const filteredPosts = posts.filter(post => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase();
        return (
            post.title?.toLowerCase().includes(search) ||
            post.content?.toLowerCase().includes(search) ||
            post.authorName?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="admin-page">
            <h1>Gestion des Posts</h1>
            
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
                        placeholder="Rechercher par titre, contenu ou auteur..."
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
                            ✨ {filteredPosts.length} résultat(s) sur {posts.length} post(s)
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
                            <th>Titre / Sujet</th>
                            <th>Auteur</th>
                            <th>Catégorie</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPosts.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                                    {searchTerm ? "Aucun post ne correspond à votre recherche" : "Aucun post disponible"}
                                </td>
                            </tr>
                        ) : (
                            filteredPosts.map((post) => (
                            <tr key={post.id}>
                                <td>
                                    <Link to={`/post/${post.id}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'bold' }}>
                                        {post.title}
                                    </Link>
                                    {post.isPinned && <span className="status-badge status-admin" style={{ marginLeft: '0.5rem' }}>📌 Pinned</span>}
                                </td>
                                <td>{post.authorName || "Anonyme"}</td>
                                <td>
                                    <span className="status-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#cbd5e1' }}>
                                        {post.category}
                                    </span>
                                </td>
                                <td>{new Date((post.createdAt?.seconds || 0) * 1000).toLocaleDateString()}</td>
                                <td>
                                    <button className="admin-btn btn-danger" onClick={() => handleDelete(post.id)}>
                                        🗑️ Suppr
                                    </button>
                                    <button className="admin-btn btn-primary" onClick={() => togglePin(post)}>
                                        {post.isPinned ? "Unpin" : "Pin"}
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
