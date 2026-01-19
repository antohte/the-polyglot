import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthContext";
import "../styles/Modal.css";

export default function ReportModal({ postId, onClose }) {
    const { user } = useAuth();
    const [reason, setReason] = useState("spam");
    const [details, setDetails] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Vous devez être connecté pour signaler un post");
            return;
        }

        setSubmitting(true);
        try {
            const reportData = {
                postId,
                reason,
                details: details.trim() || "",
                reportedBy: user.email || "Anonyme",
                reportedById: user.uid,
                status: "pending",
                createdAt: serverTimestamp()
            };
            
            console.log("Envoi du signalement:", reportData);
            await addDoc(collection(db, "reports"), reportData);
            console.log("Signalement envoyé avec succès");
            alert("✅ Signalement envoyé. Merci pour votre contribution !");
            onClose();
        } catch (err) {
            console.error("Error reporting post:", err);
            console.error("Error details:", err.message);
            alert(`❌ Erreur lors du signalement: ${err.message || "Erreur inconnue"}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="modal-backdrop" onClick={onClose} />
            <div className="modal-panel" role="dialog" aria-modal="true">
                <div className="modal-header">
                    <h3>🚨 Signaler ce post</h3>
                    <button className="btn btn-ghost" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="card form">
                    <label>
                        Raison du signalement
                        <select 
                            className="ui-select" 
                            value={reason} 
                            onChange={(e) => setReason(e.target.value)}
                        >
                            <option value="spam">🚫 Spam</option>
                            <option value="inappropriate">⚠️ Contenu inapproprié</option>
                            <option value="harassment">😡 Harcèlement</option>
                            <option value="misinformation">🤥 Désinformation</option>
                            <option value="other">❓ Autre</option>
                        </select>
                    </label>

                    <label>
                        Détails supplémentaires (optionnel)
                        <textarea
                            className="ui-input"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Expliquez pourquoi vous signalez ce post..."
                            rows={4}
                        />
                    </label>

                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "1rem" }}>
                        <button 
                            type="button" 
                            className="btn btn-ghost" 
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            className="btn"
                            disabled={submitting}
                        >
                            {submitting ? "Envoi..." : "Signaler"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
