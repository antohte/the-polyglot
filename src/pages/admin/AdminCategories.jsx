import { useEffect, useState } from "react";
import { api } from "../../api/client";
import "../../styles/Admin.css";
import AdminModal from "../../components/AdminModal";

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'subcategories'

    // Create / Delete State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', description: '', parent_id: null });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cats, reqs] = await Promise.all([
                api.categories.getAll(),
                api.categories.getRequests()
            ]);
            setCategories(cats);
            setRequests(reqs);
        } catch (error) {
            console.error("Erreur chargement:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Approval Logic ---
    async function approveRequest(request) {
        if (!confirm(`✅ Approuver la catégorie "${request.category_name}" ?`)) return;
        try {
            await api.categories.approveRequest(request.id);
            alert("✅ Catégorie approuvée !");
            fetchData();
            setSelectedRequest(null);
        } catch (error) {
            alert("❌ Erreur: " + error.message);
        }
    }

    async function rejectRequest(request) {
        if (!confirm(`❌ Rejeter "${request.category_name}" ?`)) return;
        try {
            await api.categories.rejectRequest(request.id);
            fetchData();
            setSelectedRequest(null);
        } catch (error) {
            alert("❌ Erreur: " + error.message);
        }
    }

    // --- CRUD Logic ---
    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            // Generate basic slug
            const slug = newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            await api.categories.create({ ...newCategory, slug });
            alert(newCategory.parent_id ? "Sous-catégorie créée !" : "Catégorie créée !");
            setIsCreateOpen(false);
            setNewCategory({ name: '', description: '', parent_id: null });
            fetchData();
        } catch (err) {
            alert("Erreur création: " + err.message);
        }
    }

    const confirmDelete = (cat) => {
        setCategoryToDelete(cat);
        setDeleteModalOpen(true);
    }

    const handleDelete = async () => {
        if (!categoryToDelete) return;
        try {
            await api.categories.delete(categoryToDelete.id);
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
            fetchData();
        } catch (err) {
            alert("Erreur suppression: " + err.message);
        }
    }

    if (loading) return <div className="admin-loading">Chargement...</div>;

    // Filter categories and subcategories
    const mainCategories = categories.filter(c => !c.parent_id);
    const subCategories = categories.filter(c => c.parent_id);

    return (
        <div className="admin-page">
            <div className="section-header">
                <div>
                    <h1>Gestion des Catégories</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Structurez le contenu du forum.</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setNewCategory({ name: '', description: '', parent_id: activeTab === 'subcategories' ? null : null });
                        setIsCreateOpen(true);
                    }}
                    style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                >
                    + {activeTab === 'categories' ? 'Nouvelle Catégorie' : 'Nouvelle Sous-Catégorie'}
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                <button
                    onClick={() => setActiveTab('categories')}
                    style={{
                        padding: '1rem 2rem',
                        background: activeTab === 'categories' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'categories' ? '2px solid #6366f1' : '2px solid transparent',
                        color: activeTab === 'categories' ? '#818cf8' : '#94a3b8',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        fontSize: '1rem'
                    }}
                >
                    📂 Catégories Principales ({mainCategories.length})
                </button>
                <button
                    onClick={() => setActiveTab('subcategories')}
                    style={{
                        padding: '1rem 2rem',
                        background: activeTab === 'subcategories' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'subcategories' ? '2px solid #a855f7' : '2px solid transparent',
                        color: activeTab === 'subcategories' ? '#c4b5fd' : '#94a3b8',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        fontSize: '1rem'
                    }}
                >
                    📁 Sous-Catégories ({subCategories.length})
                </button>
            </div>

            {/* REQUESTS SECTION */}
            {requests.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#fbbf24', marginBottom: '1rem' }}>⚠️ Demandes en attente ({requests.length})</h2>
                    <div className="admin-table-container" style={{ border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Nom proposé</th>
                                    <th>Par</th>
                                    <th>Raison</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(req => (
                                    <tr key={req.id}>
                                        <td style={{ fontWeight: 'bold' }}>{req.category_name}</td>
                                        <td>{req.requester_name || "Utilisateur"}</td>
                                        <td>{req.reason}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="admin-btn btn-success" onClick={() => approveRequest(req)}>✅</button>
                                                <button className="admin-btn btn-danger" onClick={() => rejectRequest(req)}>❌</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ACTIVE CATEGORIES OR SUBCATEGORIES */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Description</th>
                            {activeTab === 'subcategories' && <th>Catégorie Parent</th>}
                            <th>Slug</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(activeTab === 'categories' ? mainCategories : subCategories).length === 0 ? (
                            <tr>
                                <td colSpan={activeTab === 'subcategories' ? "5" : "4"} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                    Aucune {activeTab === 'categories' ? 'catégorie' : 'sous-catégorie'} disponible
                                </td>
                            </tr>
                        ) : (
                            (activeTab === 'categories' ? mainCategories : subCategories).map((cat) => (
                                <tr key={cat.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '1.2rem', color: activeTab === 'categories' ? '#818cf8' : '#c4b5fd' }}>
                                                {activeTab === 'categories' ? '#' : '↳'}
                                            </span>
                                            <span style={{ fontWeight: '600', color: 'white' }}>{cat.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: '#94a3b8' }}>{cat.description || "—"}</td>
                                    {activeTab === 'subcategories' && (
                                        <td style={{ color: '#818cf8' }}>
                                            {categories.find(c => c.id === cat.parent_id)?.name || '—'}
                                        </td>
                                    )}
                                    <td style={{ fontFamily: 'monospace', color: '#c4b5fd' }}>{cat.slug}</td>
                                    <td>
                                        <button className="admin-btn btn-danger" onClick={() => confirmDelete(cat)}>
                                            🗑️ Suppr
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL: CREATE */}
            <AdminModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title={activeTab === 'categories' ? "Nouvelle Catégorie" : "Nouvelle Sous-Catégorie"}
                actions={
                    <>
                        <button onClick={() => setIsCreateOpen(false)} className="back-home-btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>Annuler</button>
                        <button onClick={handleCreateCategory} className="btn-primary">Créer</button>
                    </>
                }
            >
                <div className="settings-grid">
                    <label>
                        Nom
                        <input
                            className="input-field"
                            required
                            value={newCategory.name}
                            onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                        />
                    </label>
                    {activeTab === 'subcategories' && (
                        <label>
                            Catégorie Parent
                            <select
                                className="input-field"
                                value={newCategory.parent_id || ''}
                                onChange={e => setNewCategory({ ...newCategory, parent_id: e.target.value || null })}
                                required
                            >
                                <option value="">Sélectionner une catégorie</option>
                                {mainCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </label>
                    )}
                    <label>
                        Description
                        <textarea
                            className="input-field"
                            rows={3}
                            value={newCategory.description}
                            onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                        />
                    </label>
                </div>
            </AdminModal>

            {/* MODAL: DELETE */}
            <AdminModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Supprimer une catégorie"
                actions={
                    <>
                        <button onClick={() => setDeleteModalOpen(false)} className="back-home-btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>Annuler</button>
                        <button onClick={handleDelete} className="btn-danger">Supprimer</button>
                    </>
                }
            >
                <div style={{ color: '#e2e8f0', fontSize: '1.1rem' }}>
                    Êtes-vous sûr de vouloir supprimer <strong style={{ color: '#f8fafc' }}>"{categoryToDelete?.name}"</strong> ?
                    <br /><br />
                    <span style={{ color: '#fca5a5', fontSize: '0.9rem' }}>⚠️ Attention : Cela pourrait affecter les posts liés à cette catégorie.</span>
                </div>
            </AdminModal>

        </div>
    );
}
