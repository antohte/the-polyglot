import { useEffect, useState } from "react";
import { api } from "../../api/client";
import "../../styles/Admin.css";
import AdminModal from "../../components/AdminModal";

export default function AdminModeration() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // 'pending', 'resolved', 'all'
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await api.reports.getAll();
            setReports(data);
        } catch (err) {
            console.error("Error fetching reports:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (reportId, action) => {
        try {
            await api.reports.resolve(reportId, action);
            fetchReports();
            setSelectedReport(null);
        } catch (err) {
            alert("Erreur: " + err.message);
        }
    };

    if (loading) return <div className="admin-loading">Chargement...</div>;

    const filteredReports = reports.filter(r => {
        if (filter === 'pending') return r.status === 'pending';
        if (filter === 'resolved') return r.status !== 'pending';
        return true;
    });

    const pendingCount = reports.filter(r => r.status === 'pending').length;

    return (
        <div className="admin-page">
            <div className="section-header">
                <div>
                    <h1>🚨 Modération</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                        Gestion des signalements et contenus inappropriés.
                    </p>
                </div>
                {pendingCount > 0 && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '12px',
                        color: '#fca5a5',
                        fontWeight: '600'
                    }}>
                        {pendingCount} signalement{pendingCount > 1 ? 's' : ''} en attente
                    </div>
                )}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                <button
                    onClick={() => setFilter('pending')}
                    style={{
                        padding: '1rem 2rem',
                        background: filter === 'pending' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                        border: 'none',
                        borderBottom: filter === 'pending' ? '2px solid #ef4444' : '2px solid transparent',
                        color: filter === 'pending' ? '#fca5a5' : '#94a3b8',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        fontSize: '1rem'
                    }}
                >
                    ⚠️ En attente ({pendingCount})
                </button>
                <button
                    onClick={() => setFilter('resolved')}
                    style={{
                        padding: '1rem 2rem',
                        background: filter === 'resolved' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                        border: 'none',
                        borderBottom: filter === 'resolved' ? '2px solid #22c55e' : '2px solid transparent',
                        color: filter === 'resolved' ? '#86efac' : '#94a3b8',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        fontSize: '1rem'
                    }}
                >
                    ✅ Traités
                </button>
                <button
                    onClick={() => setFilter('all')}
                    style={{
                        padding: '1rem 2rem',
                        background: filter === 'all' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                        border: 'none',
                        borderBottom: filter === 'all' ? '2px solid #6366f1' : '2px solid transparent',
                        color: filter === 'all' ? '#818cf8' : '#94a3b8',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        fontSize: '1rem'
                    }}
                >
                    📋 Tous ({reports.length})
                </button>
            </div>

            {/* Reports Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Contenu</th>
                            <th>Signalé par</th>
                            <th>Raison</th>
                            <th>Date</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReports.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                    {filter === 'pending' ? '✅ Aucun signalement en attente' : 'Aucun signalement'}
                                </td>
                            </tr>
                        ) : (
                            filteredReports.map(report => (
                                <tr key={report.id}>
                                    <td>
                                        <span className="status-badge" style={{
                                            background: report.content_type === 'post' ? 'rgba(99, 102, 241, 0.1)' :
                                                report.content_type === 'comment' ? 'rgba(168, 85, 247, 0.1)' :
                                                    'rgba(236, 72, 153, 0.1)',
                                            color: report.content_type === 'post' ? '#818cf8' :
                                                report.content_type === 'comment' ? '#c4b5fd' : '#f9a8d4',
                                            border: `1px solid ${report.content_type === 'post' ? 'rgba(99, 102, 241, 0.2)' :
                                                report.content_type === 'comment' ? 'rgba(168, 85, 247, 0.2)' :
                                                    'rgba(236, 72, 153, 0.2)'}`
                                        }}>
                                            {report.content_type === 'post' ? '📝 Post' :
                                                report.content_type === 'comment' ? '💬 Commentaire' : '👤 Utilisateur'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '500', color: '#e2e8f0' }}>
                                            {report.content_title || 'Contenu supprimé'}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                            Par: {report.reported_user_name || 'Utilisateur inconnu'}
                                        </div>
                                    </td>
                                    <td style={{ color: '#94a3b8' }}>{report.reporter_name}</td>
                                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#cbd5e1' }}>
                                        {report.reason}
                                    </td>
                                    <td style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${report.status === 'pending' ? 'status-pending' : 'status-success'}`}>
                                            {report.status === 'pending' ? '⏳ En attente' :
                                                report.status === 'resolved' ? '✅ Traité' : '❌ Rejeté'}
                                        </span>
                                    </td>
                                    <td>
                                        {report.status === 'pending' ? (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="admin-btn btn-success"
                                                    onClick={() => handleResolve(report.id, 'action_taken')}
                                                    title="Marquer comme traité"
                                                >
                                                    ✅
                                                </button>
                                                <button
                                                    className="admin-btn btn-danger"
                                                    onClick={() => handleResolve(report.id, 'dismiss')}
                                                    title="Rejeter"
                                                >
                                                    ❌
                                                </button>
                                                <button
                                                    className="admin-btn"
                                                    onClick={() => setSelectedReport(report)}
                                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                                >
                                                    👁️
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>—</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedReport && (
                <AdminModal
                    isOpen={!!selectedReport}
                    onClose={() => setSelectedReport(null)}
                    title="Détails du signalement"
                    actions={
                        selectedReport.status === 'pending' ? (
                            <>
                                <button
                                    onClick={() => handleResolve(selectedReport.id, 'dismiss')}
                                    className="btn-danger"
                                >
                                    ❌ Rejeter
                                </button>
                                <button
                                    onClick={() => handleResolve(selectedReport.id, 'action_taken')}
                                    className="btn-primary"
                                >
                                    ✅ Marquer comme traité
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setSelectedReport(null)} className="btn-primary">Fermer</button>
                        )
                    }
                >
                    <div style={{ color: '#e2e8f0', fontSize: '1rem' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Type de contenu</div>
                            <div style={{ fontWeight: '600' }}>
                                {selectedReport.content_type === 'post' ? '📝 Post' :
                                    selectedReport.content_type === 'comment' ? '💬 Commentaire' : '👤 Utilisateur'}
                            </div>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Contenu signalé</div>
                            <div style={{ fontWeight: '600' }}>{selectedReport.content_title}</div>
                            <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                Par: {selectedReport.reported_user_name}
                            </div>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Signalé par</div>
                            <div>{selectedReport.reporter_name}</div>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Raison</div>
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                {selectedReport.reason}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Date du signalement</div>
                            <div>{new Date(selectedReport.created_at).toLocaleString('fr-FR')}</div>
                        </div>
                    </div>
                </AdminModal>
            )}
        </div>
    );
}
