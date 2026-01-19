import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, orderBy, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "../../styles/Admin.css";

export default function AdminModeration() {
    const [reports, setReports] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("reports"); // "reports" or "history"
    const [filterStatus, setFilterStatus] = useState("all"); // "all", "pending", "approved", "rejected"
    const [sortBy, setSortBy] = useState("threat"); // "threat", "date"
    const [groupedReports, setGroupedReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [postData, setPostData] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch reports
            const reportsSnap = await getDocs(collection(db, "reports"));
            const reportsData = reportsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReports(reportsData);

            // Group reports by postId and calculate threat level
            const postReportsMap = {};
            reportsData.filter(r => r.status === "pending" || !r.status).forEach(report => {
                if (!postReportsMap[report.postId]) {
                    postReportsMap[report.postId] = {
                        postId: report.postId,
                        reports: [],
                        threatLevel: 0,
                        post: null
                    };
                }
                postReportsMap[report.postId].reports.push(report);
            });

            // Fetch post data for each reported post and calculate threat level
            const grouped = await Promise.all(Object.values(postReportsMap).map(async (item) => {
                const reportCount = item.reports.length;
                
                // Threat level based purely on number of reports
                // 1-2: Low, 3-5: Medium, 6-9: High, 10+: Critical
                if (reportCount >= 10) {
                    item.threatLevel = 100; // Critical
                } else if (reportCount >= 6) {
                    item.threatLevel = 70; // High
                } else if (reportCount >= 3) {
                    item.threatLevel = 40; // Medium
                } else {
                    item.threatLevel = 20; // Low
                }
                
                // Fetch post data
                try {
                    const postDoc = await getDoc(doc(db, "posts", item.postId));
                    if (postDoc.exists()) {
                        item.post = { id: postDoc.id, ...postDoc.data() };
                    }
                } catch (err) {
                    console.error("Error fetching post:", err);
                }
                
                return item;
            }));

            setGroupedReports(grouped);

            // Fetch moderation history
            const historyQuery = query(collection(db, "moderationHistory"), orderBy("timestamp", "desc"));
            const historySnap = await getDocs(historyQuery);
            const historyData = historySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setHistory(historyData);
        } catch (err) {
            console.error("Error fetching moderation data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (postId, action, reportIds) => {
        try {
            // Update all reports for this post
            for (const reportId of reportIds) {
                await updateDoc(doc(db, "reports", reportId), {
                    status: action,
                    resolvedAt: new Date()
                });
            }

            // If action is to delete post, delete it
            if (action === "approved" && postId) {
                await deleteDoc(doc(db, "posts", postId));
            }

            // Add to history
            await addDoc(collection(db, "moderationHistory"), {
                postId,
                action,
                reportCount: reportIds.length,
                moderator: "Admin", // TODO: Add current admin user
                timestamp: new Date()
            });

            // Refresh data
            fetchData();
            alert(`✅ Action effectuée : ${action === "approved" ? "Post supprimé" : "Signalements rejetés"}`);
        } catch (err) {
            console.error("Error handling moderation action:", err);
            alert("❌ Erreur lors de l'action");
        }
    };

    const filteredHistory = filterStatus === "all" 
        ? history 
        : history.filter(h => h.action === filterStatus);

    // Sort grouped reports
    const sortedReports = [...groupedReports].sort((a, b) => {
        if (sortBy === "threat") {
            return b.threatLevel - a.threatLevel;
        } else {
            const dateA = a.reports[0]?.createdAt?.seconds || 0;
            const dateB = b.reports[0]?.createdAt?.seconds || 0;
            return dateB - dateA;
        }
    });

    const getThreatColor = (level) => {
        if (level >= 70) return { bg: "rgba(239, 68, 68, 0.3)", color: "#fca5a5", label: "🔴 CRITIQUE" };
        if (level >= 40) return { bg: "rgba(249, 115, 22, 0.3)", color: "#fdba74", label: "🟠 ÉLEVÉ" };
        if (level >= 20) return { bg: "rgba(234, 179, 8, 0.3)", color: "#fde047", label: "🟡 MOYEN" };
        return { bg: "rgba(34, 197, 94, 0.3)", color: "#86efac", label: "🟢 FAIBLE" };
    };

    const viewDetails = (item) => {
        setSelectedReport(item);
    };

    const closeDetails = () => {
        setSelectedReport(null);
    };

    if (loading) return <div className="admin-loading">Chargement...</div>;

    return (
        <div className="admin-page">
            <h1>🚨 Modération</h1>

            <div className="tabs" style={{ 
                display: "flex", 
                gap: "1rem", 
                marginBottom: "2rem",
                borderBottom: "2px solid rgba(255,255,255,0.1)"
            }}>
                <button
                    className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
                    onClick={() => setActiveTab("reports")}
                    style={{
                        padding: "0.75rem 1.5rem",
                        background: activeTab === "reports" ? "rgba(139, 92, 246, 0.2)" : "transparent",
                        border: "none",
                        color: activeTab === "reports" ? "#c4b5fd" : "#94a3b8",
                        cursor: "pointer",
                        borderBottom: activeTab === "reports" ? "2px solid #8b5cf6" : "none",
                        transition: "all 0.3s ease"
                    }}
                >
                    📋 Signalements ({reports.filter(r => r.status === "pending").length})
                </button>
                <button
                    className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
                    onClick={() => setActiveTab("history")}
                    style={{
                        padding: "0.75rem 1.5rem",
                        background: activeTab === "history" ? "rgba(139, 92, 246, 0.2)" : "transparent",
                        border: "none",
                        color: activeTab === "history" ? "#c4b5fd" : "#94a3b8",
                        cursor: "pointer",
                        borderBottom: activeTab === "history" ? "2px solid #8b5cf6" : "none",
                        transition: "all 0.3s ease"
                    }}
                >
                    📚 Historique ({history.length})
                </button>
            </div>

            {activeTab === "reports" ? (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h2>Signalements en attente ({groupedReports.length} posts)</h2>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Trier par:</span>
                            <select 
                                className="input-field"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={{ width: "auto", padding: "0.5rem 1rem" }}
                            >
                                <option value="threat">🎯 Niveau de menace</option>
                                <option value="date">📅 Date</option>
                            </select>
                        </div>
                    </div>
                    
                    {sortedReports.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                            ✅ Aucun signalement en attente
                        </div>
                    ) : (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Niveau de Menace</th>
                                        <th>Titre du Post</th>
                                        <th>Auteur</th>
                                        <th>Nombre de Signalements</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedReports.map((item) => {
                                        const threat = getThreatColor(item.threatLevel);
                                        const post = item.post;

                                        return (
                                            <tr key={item.postId}>
                                                <td>
                                                    <div style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "0.5rem"
                                                    }}>
                                                        <div style={{
                                                            width: "100%",
                                                            maxWidth: "100px",
                                                            height: "8px",
                                                            background: "rgba(255,255,255,0.1)",
                                                            borderRadius: "4px",
                                                            overflow: "hidden"
                                                        }}>
                                                            <div style={{
                                                                width: `${item.threatLevel}%`,
                                                                height: "100%",
                                                                background: threat.color,
                                                                transition: "width 0.3s"
                                                            }} />
                                                        </div>
                                                        <span style={{
                                                            background: threat.bg,
                                                            color: threat.color,
                                                            padding: "0.25rem 0.75rem",
                                                            borderRadius: "12px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: "bold",
                                                            whiteSpace: "nowrap"
                                                        }}>
                                                            {threat.label}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {post ? (
                                                        <div>
                                                            <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>
                                                                {post.title}
                                                            </div>
                                                            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                                                {post.category}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Post supprimé</span>
                                                    )}
                                                </td>
                                                <td>{post?.authorName || "—"}</td>
                                                <td>
                                                    <span style={{
                                                        background: "rgba(139, 92, 246, 0.3)",
                                                        color: "#c4b5fd",
                                                        padding: "0.25rem 0.75rem",
                                                        borderRadius: "12px",
                                                        fontSize: "0.875rem",
                                                        fontWeight: "bold"
                                                    }}>
                                                        {item.reports.length}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                                        <button
                                                            className="admin-btn"
                                                            onClick={() => viewDetails(item)}
                                                            style={{
                                                                background: "rgba(59, 130, 246, 0.2)",
                                                                color: "#93c5fd",
                                                                border: "1px solid rgba(59, 130, 246, 0.3)"
                                                            }}
                                                        >
                                                            👁️ Voir Détails
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <h2>Historique des Actions</h2>
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
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
                                Tout ({history.length})
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
                                Approuvés ({history.filter(h => h.action === "approved").length})
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
                                Rejetés ({history.filter(h => h.action === "rejected").length})
                            </button>
                        </div>
                    </div>

                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Action</th>
                                    <th>Raison</th>
                                    <th>Post ID</th>
                                    <th>Modérateur</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                                            Aucun historique
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHistory.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleString() : "—"}</td>
                                            <td>
                                                <span className={`status-badge ${item.action === "approved" ? "status-success" : "status-danger"}`}>
                                                    {item.action === "approved" ? "✅ Approuvé" : "❌ Rejeté"}
                                                </span>
                                            </td>
                                            <td>{item.reason || "—"}</td>
                                            <td>
                                                <code style={{ 
                                                    background: "rgba(255,255,255,0.1)", 
                                                    padding: "0.25rem 0.5rem",
                                                    borderRadius: "4px",
                                                    fontSize: "0.875rem"
                                                }}>
                                                    {item.postId?.substring(0, 8)}...
                                                </code>
                                            </td>
                                            <td>{item.moderator || "Admin"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de détails du signalement */}
            {selectedReport && (
                <>
                    <div className="modal-backdrop" onClick={closeDetails} />
                    <div className="modal-panel" role="dialog" aria-modal="true" style={{ maxWidth: "900px", width: "95%", background: "#1a1f2e" }}>
                        <div className="modal-header" style={{ borderBottom: "2px solid rgba(139, 92, 246, 0.5)", paddingBottom: "1rem", background: "#0f1419" }}>
                            <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#a78bfa", fontWeight: "700" }}>🚨 Détails du Signalement</h3>
                            <button className="btn btn-ghost" onClick={closeDetails} style={{ fontSize: "1.5rem", color: "#64748b" }}>✕</button>
                        </div>

                        <div style={{ padding: "2rem", maxHeight: "75vh", overflowY: "auto", background: "#1a1f2e" }}>
                            {/* Stats en haut */}
                            <div style={{ 
                                display: "grid", 
                                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                                gap: "1rem", 
                                marginBottom: "2rem" 
                            }}>
                                <div style={{ 
                                    background: "linear-gradient(135deg, #dc2626, #991b1b)", 
                                    padding: "1.25rem", 
                                    borderRadius: "12px", 
                                    border: "2px solid #ef4444",
                                    textAlign: "center"
                                }}>
                                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🚨</div>
                                    <div style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#fef2f2", marginBottom: "0.25rem" }}>
                                        {selectedReport.reports.length}
                                    </div>
                                    <div style={{ fontSize: "0.875rem", color: "#fecaca", fontWeight: "600" }}>Signalements</div>
                                </div>
                                <div style={{ 
                                    background: "linear-gradient(135deg, #7c3aed, #5b21b6)", 
                                    padding: "1.25rem", 
                                    borderRadius: "12px", 
                                    border: "2px solid #a78bfa",
                                    textAlign: "center"
                                }}>
                                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                                        {(() => {
                                            const threat = getThreatColor(selectedReport.threatLevel);
                                            return threat.label.split(' ')[0];
                                        })()}
                                    </div>
                                    <div style={{ fontSize: "1rem", fontWeight: "bold", color: "#faf5ff", marginBottom: "0.25rem" }}>
                                        {getThreatColor(selectedReport.threatLevel).label}
                                    </div>
                                    <div style={{ fontSize: "0.875rem", color: "#e9d5ff", fontWeight: "600" }}>Niveau de menace</div>
                                </div>
                            </div>

                            {/* Informations du post */}
                            <div style={{ 
                                background: "#0f1419", 
                                padding: "2rem", 
                                borderRadius: "16px", 
                                marginBottom: "2rem",
                                border: "2px solid #3b82f6"
                            }}>
                                <div style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "0.75rem", 
                                    marginBottom: "1.5rem",
                                    paddingBottom: "1rem",
                                    borderBottom: "2px solid #3b82f6"
                                }}>
                                    <span style={{ fontSize: "1.75rem" }}>📄</span>
                                    <h4 style={{ margin: 0, fontSize: "1.4rem", color: "#60a5fa", fontWeight: "700", textTransform: "uppercase" }}>Contenu du Post</h4>
                                </div>
                                {selectedReport.post ? (
                                    <div style={{ display: "grid", gap: "1.5rem" }}>
                                        <div>
                                            <div style={{ 
                                                fontSize: "0.75rem", 
                                                textTransform: "uppercase", 
                                                letterSpacing: "0.1em", 
                                                color: "#60a5fa",
                                                marginBottom: "0.5rem",
                                                fontWeight: "700"
                                            }}>
                                                📌 Titre
                                            </div>
                                            <div style={{ 
                                                fontSize: "1.3rem", 
                                                fontWeight: "700", 
                                                color: "#f8fafc",
                                                lineHeight: "1.4"
                                            }}>
                                                {selectedReport.post.title}
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                                            <div>
                                                <div style={{ 
                                                    fontSize: "0.75rem", 
                                                    textTransform: "uppercase", 
                                                    letterSpacing: "0.1em", 
                                                    color: "#60a5fa",
                                                    marginBottom: "0.5rem",
                                                    fontWeight: "700"
                                                }}>
                                                    👤 Auteur
                                                </div>
                                                <div style={{ color: "#e2e8f0", fontWeight: "600" }}>{selectedReport.post.authorName}</div>
                                            </div>
                                            <div>
                                                <div style={{ 
                                                    fontSize: "0.75rem", 
                                                    textTransform: "uppercase", 
                                                    letterSpacing: "0.1em", 
                                                    color: "#60a5fa",
                                                    marginBottom: "0.5rem",
                                                    fontWeight: "700"
                                                }}>
                                                    📂 Catégorie
                                                </div>
                                                <span style={{ 
                                                    background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
                                                    color: "#e9d5ff",
                                                    padding: "0.4rem 1rem",
                                                    borderRadius: "20px",
                                                    fontSize: "0.875rem",
                                                    fontWeight: "700",
                                                    display: "inline-block",
                                                    border: "2px solid #a78bfa"
                                                }}>
                                                    {selectedReport.post.category}
                                                </span>
                                            </div>
                                            <div>
                                                <div style={{ 
                                                    fontSize: "0.75rem", 
                                                    textTransform: "uppercase", 
                                                    letterSpacing: "0.1em", 
                                                    color: "#60a5fa",
                                                    marginBottom: "0.5rem",
                                                    fontWeight: "700"
                                                }}>
                                                    📅 Date
                                                </div>
                                                <div style={{ color: "#e2e8f0", fontWeight: "600" }}>
                                                    {selectedReport.post.createdAt ? new Date(selectedReport.post.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : "—"}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ 
                                                fontSize: "0.75rem", 
                                                textTransform: "uppercase", 
                                                letterSpacing: "0.1em", 
                                                color: "#60a5fa",
                                                marginBottom: "0.75rem",
                                                fontWeight: "700"
                                            }}>
                                                📝 Contenu
                                            </div>
                                            <div style={{ 
                                                padding: "1.25rem", 
                                                background: "#0a0e14", 
                                                borderRadius: "10px",
                                                whiteSpace: "pre-wrap",
                                                wordWrap: "break-word",
                                                color: "#e2e8f0",
                                                lineHeight: "1.8",
                                                border: "2px solid #3b82f6",
                                                fontSize: "1rem"
                                            }}>
                                                {selectedReport.post.content}
                                            </div>
                                        </div>

                                        {selectedReport.post.mediaUrl && (
                                            <div>
                                                <div style={{ 
                                                    fontSize: "0.75rem", 
                                                    textTransform: "uppercase", 
                                                    letterSpacing: "0.1em", 
                                                    color: "#60a5fa",
                                                    marginBottom: "0.75rem",
                                                    fontWeight: "700"
                                                }}>
                                                    🖼️ Média joint
                                                </div>
                                                <div style={{ 
                                                    borderRadius: "10px", 
                                                    overflow: "hidden",
                                                    border: "2px solid #3b82f6"
                                                }}>
                                                    {selectedReport.post.mediaType === "video" ? (
                                                        <video controls style={{ width: "100%", display: "block" }} src={selectedReport.post.mediaUrl} />
                                                    ) : (
                                                        <img style={{ width: "100%", display: "block" }} src={selectedReport.post.mediaUrl} alt="media" />
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ 
                                        textAlign: "center", 
                                        padding: "2rem", 
                                        color: "#94a3b8", 
                                        fontStyle: "italic",
                                        fontSize: "1rem"
                                    }}>
                                        ⚠️ Ce post a été supprimé
                                    </div>
                                )}
                            </div>

                            {/* Signalements */}
                            <div style={{ 
                                background: "#0f1419", 
                                padding: "2rem", 
                                borderRadius: "16px",
                                border: "2px solid #ef4444"
                            }}>
                                <div style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "0.75rem", 
                                    marginBottom: "1.5rem",
                                    paddingBottom: "1rem",
                                    borderBottom: "2px solid #ef4444"
                                }}>
                                    <span style={{ fontSize: "1.75rem" }}>🚨</span>
                                    <h4 style={{ margin: 0, fontSize: "1.4rem", color: "#fca5a5", fontWeight: "700", textTransform: "uppercase" }}>
                                        Liste des Signalements ({selectedReport.reports.length})
                                    </h4>
                                </div>
                                <div style={{ display: "grid", gap: "1rem" }}>
                                    {selectedReport.reports.map((report, index) => (
                                        <div key={report.id} style={{ 
                                            background: "#0a0e14", 
                                            padding: "1.5rem", 
                                            borderRadius: "12px",
                                            border: "2px solid #ef4444"
                                        }}>
                                            <div style={{ 
                                                display: "flex", 
                                                justifyContent: "space-between", 
                                                alignItems: "center",
                                                marginBottom: "1rem",
                                                paddingBottom: "0.75rem",
                                                borderBottom: "2px solid #ef4444"
                                            }}>
                                                <div style={{ 
                                                    background: "linear-gradient(135deg, #dc2626, #991b1b)",
                                                    color: "#fef2f2",
                                                    padding: "0.5rem 1.25rem",
                                                    borderRadius: "20px",
                                                    fontSize: "1rem",
                                                    fontWeight: "800",
                                                    border: "2px solid #ef4444"
                                                }}>
                                                    #{index + 1}
                                                </div>
                                                <span style={{ color: "#e2e8f0", fontSize: "0.875rem", fontWeight: "600" }}>
                                                    📅 {report.createdAt ? new Date(report.createdAt.seconds * 1000).toLocaleString('fr-FR') : "—"}
                                                </span>
                                            </div>
                                            
                                            <div style={{ display: "grid", gap: "1rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                    <span style={{ fontSize: "2rem" }}>
                                                        {report.reason === "spam" ? "🚫" :
                                                         report.reason === "inappropriate" ? "⚠️" :
                                                         report.reason === "harassment" ? "😡" :
                                                         report.reason === "misinformation" ? "🤥" : "❓"}
                                                    </span>
                                                    <span style={{ 
                                                        background: report.reason === "spam" ? "linear-gradient(135deg, #dc2626, #991b1b)" :
                                                                  report.reason === "inappropriate" ? "linear-gradient(135deg, #ea580c, #9a3412)" :
                                                                  report.reason === "harassment" ? "linear-gradient(135deg, #7c3aed, #5b21b6)" :
                                                                  "linear-gradient(135deg, #475569, #334155)",
                                                        color: report.reason === "spam" ? "#fecaca" :
                                                              report.reason === "inappropriate" ? "#fed7aa" :
                                                              report.reason === "harassment" ? "#e9d5ff" :
                                                              "#e2e8f0",
                                                        padding: "0.6rem 1.5rem",
                                                        borderRadius: "20px",
                                                        fontSize: "1rem",
                                                        fontWeight: "700",
                                                        border: `2px solid ${report.reason === "spam" ? "#ef4444" :
                                                                  report.reason === "inappropriate" ? "#f97316" :
                                                                  report.reason === "harassment" ? "#a78bfa" :
                                                                  "#64748b"}`
                                                    }}>
                                                        {report.reason === "spam" ? "Spam" :
                                                         report.reason === "inappropriate" ? "Contenu inapproprié" :
                                                         report.reason === "harassment" ? "Harcèlement" :
                                                         report.reason === "misinformation" ? "Désinformation" : "Autre"}
                                                    </span>
                                                </div>

                                                <div style={{ 
                                                    background: "#1a1f2e", 
                                                    padding: "0.75rem 1rem",
                                                    borderRadius: "8px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.5rem",
                                                    border: "2px solid #3b82f6"
                                                }}>
                                                    <span style={{ fontSize: "1.5rem" }}>👤</span>
                                                    <span style={{ color: "#e2e8f0", fontWeight: "600" }}>{report.reportedBy || "Anonyme"}</span>
                                                </div>

                                                {report.details && (
                                                    <div>
                                                        <div style={{ 
                                                            fontSize: "0.75rem", 
                                                            textTransform: "uppercase", 
                                                            letterSpacing: "0.1em", 
                                                            color: "#a78bfa",
                                                            marginBottom: "0.5rem",
                                                            fontWeight: "700"
                                                        }}>
                                                            💬 Commentaire additionnel
                                                        </div>
                                                        <div style={{ 
                                                            padding: "1rem", 
                                                            background: "#1a1f2e", 
                                                            borderRadius: "8px",
                                                            fontStyle: "italic",
                                                            color: "#e2e8f0",
                                                            lineHeight: "1.6",
                                                            border: "2px solid #a78bfa",
                                                            fontSize: "0.95rem"
                                                        }}>
                                                            "{report.details}"
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ 
                                display: "flex", 
                                gap: "1rem", 
                                marginTop: "2rem",
                                padding: "1.5rem",
                                background: "#0f1419",
                                borderRadius: "12px",
                                justifyContent: "flex-end",
                                border: "2px solid #a78bfa"
                            }}>
                                <button
                                    className="btn btn-ghost"
                                    onClick={closeDetails}
                                    style={{ padding: "0.75rem 1.5rem", fontSize: "1rem", fontWeight: "600", color: "#e2e8f0" }}
                                >
                                    Fermer
                                </button>
                                <button
                                    className="btn"
                                    onClick={() => {
                                        if (confirm("Êtes-vous sûr de vouloir rejeter tous ces signalements ?")) {
                                            handleAction(selectedReport.postId, "rejected", selectedReport.reports.map(r => r.id));
                                            closeDetails();
                                        }
                                    }}
                                    style={{
                                        background: "linear-gradient(135deg, #ea580c, #9a3412)",
                                        color: "#fed7aa",
                                        border: "2px solid #f97316",
                                        padding: "0.75rem 1.5rem",
                                        fontSize: "1rem",
                                        fontWeight: "700"
                                    }}
                                >
                                    ❌ Rejeter
                                </button>
                                <button
                                    className="btn"
                                    onClick={() => {
                                        if (confirm("⚠️ ATTENTION : Cette action va SUPPRIMER définitivement le post. Continuer ?")) {
                                            handleAction(selectedReport.postId, "approved", selectedReport.reports.map(r => r.id));
                                            closeDetails();
                                        }
                                    }}
                                    style={{
                                        background: "linear-gradient(135deg, #dc2626, #991b1b)",
                                        color: "#fecaca",
                                        border: "2px solid #ef4444",
                                        padding: "0.75rem 1.5rem",
                                        fontSize: "1rem",
                                        fontWeight: "700"
                                    }}
                                >
                                    🗑️ Supprimer le Post
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
