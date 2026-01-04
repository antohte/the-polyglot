import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "../../styles/Admin.css";
import { Link } from "react-router-dom";

export default function AdminPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="admin-page">
            <h1>Gestion des Posts</h1>
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
                        {posts.map((post) => (
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
