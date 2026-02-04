// src/components/CategoryRequestModal.jsx
import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function CategoryRequestModal({ onClose }) {
    const { user } = useAuth();
    const [categoryName, setCategoryName] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!categoryName.trim()) {
            alert("⚠️ Veuillez entrer un nom de catégorie");
            return;
        }

        setSubmitting(true);
        try {
            await api.categories.request({
                requested_by: user.uid,
                category_name: categoryName.trim(),
                reason: description.trim()
            });

            alert("✅ Votre demande a été envoyée ! Un administrateur la vérifiera prochainement.");
            onClose();
        } catch (error) {
            console.error("Erreur lors de la création de la demande:", error);
            alert("❌ Erreur lors de l'envoi de la demande: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="modal-backdrop" onClick={onClose} />
            <div className="modal-panel" role="dialog" aria-modal="true" style={{ maxWidth: "600px" }}>
                <div className="modal-header">
                    <h3>📁 Proposer une nouvelle catégorie</h3>
                    <button className="btn btn-ghost" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label className="label">Nom de la catégorie *</label>
                        <input
                            type="text"
                            className="ui-input"
                            placeholder="Ex: Échanges universitaires"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            maxLength={50}
                            required
                        />
                        <small style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                            Maximum 50 caractères
                        </small>
                    </div>

                    <div style={{ marginBottom: "2rem" }}>
                        <label className="label">Description (optionnel)</label>
                        <textarea
                            className="ui-input"
                            placeholder="Décrivez brièvement le contenu de cette catégorie..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            maxLength={200}
                        />
                        <small style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                            Maximum 200 caractères
                        </small>
                    </div>

                    <div style={{
                        background: "rgba(59, 130, 246, 0.1)",
                        border: "2px solid rgba(59, 130, 246, 0.3)",
                        borderRadius: "8px",
                        padding: "1rem",
                        marginBottom: "2rem"
                    }}>
                        <p style={{ margin: 0, fontSize: "0.875rem", color: "#93c5fd" }}>
                            ℹ️ <strong>Note :</strong> Votre demande sera examinée par un administrateur avant d'être approuvée.
                            Vous serez notifié une fois la décision prise.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
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
                            className="btn btn-primary"
                            disabled={submitting}
                            style={{
                                background: submitting ? "#64748b" : "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                                opacity: submitting ? 0.6 : 1
                            }}
                        >
                            {submitting ? "Envoi..." : "📤 Envoyer la demande"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
