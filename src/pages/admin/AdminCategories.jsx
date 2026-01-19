// src/pages/admin/AdminCategories.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../../firebase";
import "../../styles/Admin.css";

export default function AdminCategories() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("pending"); // pending, approved, rejected, all
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    async function fetchRequests() {
        setLoading(true);
        try {
            console.log("🔄 Chargement des demandes de catégories...");
            const requestsSnapshot = await getDocs(collection(db, "categoryRequests"));
            console.log(`✅ ${requestsSnapshot.docs.length} demandes trouvées`);
            const requestsData = requestsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRequests(requestsData.sort((a, b) => 
                (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
            ));
        } catch (error) {
            console.error("❌ Erreur lors du chargement des demandes:", error);
            console.error("Code d'erreur:", error.code);
            console.error("Message:", error.message);
            alert(`❌ Erreur lors du chargement des demandes: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    async function approveRequest(request) {
        if (!confirm(`✅ Approuver la catégorie "${request.name}" ?`)) return;

        try {
            const batch = writeBatch(db);

            // 1. Mettre à jour le statut de la demande
            const requestRef = doc(db, "categoryRequests", request.id);
            batch.update(requestRef, {
                status: "approved",
                approvedAt: serverTimestamp()
            });

            // 2. Ajouter la catégorie dans la collection "categories"
            const categoryRef = doc(collection(db, "categories"));
            batch.set(categoryRef, {
                name: request.name,
                slug: request.slug,
                description: request.description || "",
                createdBy: request.requestedBy,
                createdAt: serverTimestamp(),
                subcategories: []
            });

            await batch.commit();

            alert("✅ Catégorie approuvée avec succès !");
            fetchRequests();
        } catch (error) {
            console.error("Erreur lors de l'approbation:", error);
            alert("❌ Erreur lors de l'approbation: " + error.message);
        }
    }

    async function rejectRequest(request) {
        if (!confirm(`❌ Rejeter la demande de catégorie "${request.name}" ?`)) return;

        try {
            await updateDoc(doc(db, "categoryRequests", request.id), {
                status: "rejected",
                rejectedAt: serverTimestamp()
            });

            alert("✅ Demande rejetée");
            fetchRequests();
        } catch (error) {
            console.error("Erreur lors du rejet:", error);
            alert("❌ Erreur lors du rejet: " + error.message);
        }
    }

    async function deleteRequest(requestId) {
        if (!confirm("⚠️ Supprimer définitivement cette demande ?")) return;

        try {
            await deleteDoc(doc(db, "categoryRequests", requestId));
            alert("✅ Demande supprimée");
            fetchRequests();
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            alert("❌ Erreur lors de la suppression: " + error.message);
        }
    }

    const filteredRequests = requests.filter(req => {
        if (filterStatus === "all") return true;
        return req.status === filterStatus;
    });

    const statusCounts = {
        pending: requests.filter(r => r.status === "pending").length,
        approved: requests.filter(r => r.status === "approved").length,
        rejected: requests.filter(r => r.status === "rejected").length
    };

    if (loading) {
        return <div className="admin-loading">Chargement des demandes...</div>;
    }

    return (
        <div className="admin-page">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1>📁 Demandes de Catégories</h1>
            </div>

            {/* Statistiques */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem"
            }}>
                <div className="stat-card" style={{
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    color: "white"
                }}>
                    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{statusCounts.pending}</div>
                    <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>En attente</div>
                </div>
                <div className="stat-card" style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    color: "white"
                }}>
                    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{statusCounts.approved}</div>
                    <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>Approuvées</div>
                </div>
                <div className="stat-card" style={{
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    color: "white"
                }}>
                    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{statusCounts.rejected}</div>
                    <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>Rejetées</div>
                </div>
            </div>

            {/* Filtres */}
            <div style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "2rem",
                flexWrap: "wrap"
            }}>
                <button
                    className={`filter-btn ${filterStatus === "pending" ? "active" : ""}`}
                    onClick={() => setFilterStatus("pending")}
                    style={{
                        padding: "0.5rem 1rem",
                        background: filterStatus === "pending" ? "rgba(249, 115, 22, 0.3)" : "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(249, 115, 22, 0.3)",
                        color: "#fdba74",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    ⏳ En attente ({statusCounts.pending})
                </button>
                <button
                    className={`filter-btn ${filterStatus === "approved" ? "active" : ""}`}
                    onClick={() => setFilterStatus("approved")}
                    style={{
                        padding: "0.5rem 1rem",
                        background: filterStatus === "approved" ? "rgba(34, 197, 94, 0.3)" : "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        color: "#86efac",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    ✅ Approuvées ({statusCounts.approved})
                </button>
                <button
                    className={`filter-btn ${filterStatus === "rejected" ? "active" : ""}`}
                    onClick={() => setFilterStatus("rejected")}
                    style={{
                        padding: "0.5rem 1rem",
                        background: filterStatus === "rejected" ? "rgba(239, 68, 68, 0.3)" : "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#fca5a5",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    ❌ Rejetées ({statusCounts.rejected})
                </button>
                <button
                    className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
                    onClick={() => setFilterStatus("all")}
                    style={{
                        padding: "0.5rem 1rem",
                        background: filterStatus === "all" ? "rgba(139, 92, 246, 0.3)" : "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        color: "#c4b5fd",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    📋 Toutes ({requests.length})
                </button>
            </div>

            {/* Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Nom de la catégorie</th>
                            <th>Slug</th>
                            <th>Demandeur</th>
                            <th>Date</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                                    Aucune demande {filterStatus !== "all" && `en statut "${filterStatus}"`}
                                </td>
                            </tr>
                        ) : (
                            filteredRequests.map((req) => (
                                <tr key={req.id}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <span style={{ fontSize: "1.5rem" }}>📁</span>
                                            <strong>{req.name}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <code style={{
                                            background: "rgba(255,255,255,0.1)",
                                            padding: "0.25rem 0.5rem",
                                            borderRadius: "4px",
                                            fontSize: "0.875rem"
                                        }}>
                                            {req.slug}
                                        </code>
                                    </td>
                                    <td>{req.requestedByName || "Anonyme"}</td>
                                    <td>
                                        {req.createdAt
                                            ? new Date(req.createdAt.seconds * 1000).toLocaleDateString('fr-FR')
                                            : "—"}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${
                                            req.status === "pending" ? "status-warning" :
                                            req.status === "approved" ? "status-success" :
                                            "status-danger"
                                        }`}>
                                            {req.status === "pending" ? "⏳ En attente" :
                                             req.status === "approved" ? "✅ Approuvée" :
                                             "❌ Rejetée"}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button
                                                className="admin-btn btn-info"
                                                onClick={() => setSelectedRequest(req)}
                                                title="Voir les détails"
                                            >
                                                👁️
                                            </button>
                                            {req.status === "pending" && (
                                                <>
                                                    <button
                                                        className="admin-btn btn-success"
                                                        onClick={() => approveRequest(req)}
                                                        title="Approuver"
                                                    >
                                                        ✅
                                                    </button>
                                                    <button
                                                        className="admin-btn btn-warning"
                                                        onClick={() => rejectRequest(req)}
                                                        title="Rejeter"
                                                    >
                                                        ❌
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                className="admin-btn btn-danger"
                                                onClick={() => deleteRequest(req.id)}
                                                title="Supprimer"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de détails */}
            {selectedRequest && (
                <>
                    <div className="modal-backdrop" onClick={() => setSelectedRequest(null)} />
                    <div className="modal-panel" role="dialog" aria-modal="true" style={{ maxWidth: "700px", background: "#1a1f2e" }}>
                        <div className="modal-header" style={{ borderBottom: "2px solid rgba(139, 92, 246, 0.5)", background: "#0f1419" }}>
                            <h3 style={{ color: "#a78bfa" }}>📁 Détails de la demande</h3>
                            <button className="btn btn-ghost" onClick={() => setSelectedRequest(null)}>✕</button>
                        </div>

                        <div style={{ padding: "2rem", background: "#1a1f2e" }}>
                            <div style={{
                                background: "#0f1419",
                                padding: "1.5rem",
                                borderRadius: "12px",
                                border: "2px solid #3b82f6",
                                marginBottom: "1.5rem"
                            }}>
                                <h4 style={{ margin: "0 0 1rem 0", color: "#60a5fa", fontSize: "1.25rem" }}>
                                    {selectedRequest.name}
                                </h4>
                                <div style={{ display: "grid", gap: "1rem" }}>
                                    <div>
                                        <div style={{ fontSize: "0.75rem", color: "#60a5fa", marginBottom: "0.25rem", fontWeight: "600" }}>
                                            SLUG
                                        </div>
                                        <code style={{
                                            background: "#0a0e14",
                                            padding: "0.5rem",
                                            borderRadius: "6px",
                                            display: "inline-block",
                                            color: "#e2e8f0",
                                            border: "1px solid #3b82f6"
                                        }}>
                                            {selectedRequest.slug}
                                        </code>
                                    </div>
                                    {selectedRequest.description && (
                                        <div>
                                            <div style={{ fontSize: "0.75rem", color: "#60a5fa", marginBottom: "0.5rem", fontWeight: "600" }}>
                                                DESCRIPTION
                                            </div>
                                            <p style={{
                                                background: "#0a0e14",
                                                padding: "1rem",
                                                borderRadius: "8px",
                                                margin: 0,
                                                color: "#e2e8f0",
                                                lineHeight: "1.6",
                                                border: "1px solid #3b82f6"
                                            }}>
                                                {selectedRequest.description}
                                            </p>
                                        </div>
                                    )}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                        <div>
                                            <div style={{ fontSize: "0.75rem", color: "#60a5fa", marginBottom: "0.25rem", fontWeight: "600" }}>
                                                DEMANDEUR
                                            </div>
                                            <div style={{ color: "#e2e8f0", fontWeight: "500" }}>
                                                {selectedRequest.requestedByName || "Anonyme"}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "0.75rem", color: "#60a5fa", marginBottom: "0.25rem", fontWeight: "600" }}>
                                                DATE
                                            </div>
                                            <div style={{ color: "#e2e8f0", fontWeight: "500" }}>
                                                {selectedRequest.createdAt
                                                    ? new Date(selectedRequest.createdAt.seconds * 1000).toLocaleDateString('fr-FR')
                                                    : "—"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{
                                display: "flex",
                                gap: "1rem",
                                justifyContent: "flex-end",
                                padding: "1rem",
                                background: "#0f1419",
                                borderRadius: "12px",
                                border: "2px solid #a78bfa"
                            }}>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => setSelectedRequest(null)}
                                >
                                    Fermer
                                </button>
                                {selectedRequest.status === "pending" && (
                                    <>
                                        <button
                                            className="btn"
                                            onClick={() => {
                                                approveRequest(selectedRequest);
                                                setSelectedRequest(null);
                                            }}
                                            style={{
                                                background: "linear-gradient(135deg, #10b981, #059669)",
                                                color: "#d1fae5",
                                                border: "2px solid #10b981"
                                            }}
                                        >
                                            ✅ Approuver
                                        </button>
                                        <button
                                            className="btn"
                                            onClick={() => {
                                                rejectRequest(selectedRequest);
                                                setSelectedRequest(null);
                                            }}
                                            style={{
                                                background: "linear-gradient(135deg, #dc2626, #991b1b)",
                                                color: "#fecaca",
                                                border: "2px solid #ef4444"
                                            }}
                                        >
                                            ❌ Rejeter
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
