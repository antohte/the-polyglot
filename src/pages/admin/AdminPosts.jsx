import { useEffect, useState } from "react";
import { api } from "../../api/client";
import "../../styles/Admin.css";
import { Link } from "react-router-dom";
import AdminModal from "../../components/AdminModal";

export default function AdminPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const data = await api.posts.getAll();
            setPosts(data);
        } catch (err) {
            console.error("Error fetching posts:", err);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (post) => {
        setPostToDelete(post);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!postToDelete) return;

        try {
            await api.posts.delete(postToDelete.id);
            setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
            setDeleteModalOpen(false);
            setPostToDelete(null);
        } catch (err) {
            console.error("Error deleting post:", err);
            alert("Erreur lors de la suppression");
        }
    };

    const togglePin = async (post) => {
        try {
            const newStatus = !post.is_pinned;
            // Optimistic update
            setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, is_pinned: newStatus } : p)));
            await api.posts.update(post.id, { is_pinned: newStatus ? 1 : 0 });
        } catch (err) {
            console.error("Error pinning post:", err);
            fetchPosts(); // Revert
        }
    };

    if (loading) return <div className="admin-loading">Chargement des posts...</div>;

    // Filtrage
    const filteredPosts = posts.filter(post => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase();
        return (
            post.title?.toLowerCase().includes(search) ||
            post.content?.toLowerCase().includes(search) ||
            post.author_name?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="admin-page">
            <div className="section-header">
                <div>
                    <h1>Gestion des Posts</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Modération et gestion du contenu.</p>
                </div>
            </div>

            <div className="content-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: "1.5rem" }}>🔍</span>
                <input
                    type="text"
                    placeholder="Rechercher par titre, contenu ou auteur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "white",
                        fontSize: "1.1rem",
                        width: "100%",
                        outline: "none"
                    }}
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm("")} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        ✕
                    </button>
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
                                <td colSpan="5" style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                                    {searchTerm ? "Aucun post ne correspond à votre recherche" : "Aucun post disponible"}
                                </td>
                            </tr>
                        ) : (
                            filteredPosts.map((post) => (
                                <tr key={post.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {post.is_pinned && <span title="Épinglé">📌</span>}
                                            <Link to={`/post/${post.id}`} style={{ color: '#f1f5f9', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}>
                                                {post.title}
                                            </Link>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                                            {post.content?.substring(0, 60)}...
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '500', color: '#e2e8f0' }}>{post.author_name || "Anonyme"}</div>
                                    </td>
                                    <td>
                                        <span className="status-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                            {post.category_slug || post.category || 'Général'}
                                        </span>
                                    </td>
                                    <td style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="admin-btn"
                                                onClick={() => togglePin(post)}
                                                style={{
                                                    background: post.is_pinned ? 'rgba(234, 179, 8, 0.1)' : 'rgba(255,255,255,0.05)',
                                                    color: post.is_pinned ? '#facc15' : '#94a3b8',
                                                    border: post.is_pinned ? '1px solid rgba(234, 179, 8, 0.2)' : 'none'
                                                }}
                                            >
                                                {post.is_pinned ? "Désépingler" : "Épingler"}
                                            </button>
                                            <button className="admin-btn btn-danger" onClick={() => confirmDelete(post)}>
                                                🗑️
                                            </button>
                                            <Link to={`/post/${post.id}`} target="_blank" className="admin-btn btn-primary" style={{ textDecoration: 'none' }}>
                                                Voir
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            <AdminModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirmer la suppression"
                actions={
                    <>
                        <button onClick={() => setDeleteModalOpen(false)} className="back-home-btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>Annuler</button>
                        <button onClick={handleDelete} className="admin-btn btn-danger">Supprimer définitivement</button>
                    </>
                }
            >
                <div style={{ color: '#e2e8f0', fontSize: '1.1rem' }}>
                    Êtes-vous sûr de vouloir supprimer le post <strong style={{ color: '#f8fafc' }}>"{postToDelete?.title}"</strong> ?
                    <br /><br />
                    <span style={{ color: '#fca5a5', fontSize: '0.9rem' }}>⚠️ Cette action est irréversible.</span>
                </div>
            </AdminModal>
        </div>
    );
}
