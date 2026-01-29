// src/components/SubcategoryModal.jsx
import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "./Toast";

export default function SubcategoryModal({ categoryId, categoryName, categorySlug, onClose, onSuccess }) {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [subcategoryName, setSubcategoryName] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!subcategoryName.trim()) {
            addToast("Veuillez entrer un nom de sous-catégorie", "warning");
            return;
        }

        if (!categoryId) {
            addToast("Impossible d'ajouter une sous-catégorie : catégorie parente non trouvée en base.", "error");
            return;
        }

        setSubmitting(true);
        try {
            const slug = subcategoryName.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

            await api.categories.create({
                name: subcategoryName.trim(),
                slug,
                description: "",
                parent_id: categoryId,
                // created_by: user.uid // If column added
            });

            addToast("Sous-catégorie créée avec succès", "success");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Erreur lors de la création de la sous-catégorie:", error);
            addToast("Erreur lors de la création", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="modal-backdrop" onClick={onClose} />
            <div className="modal-panel" role="dialog" aria-modal="true" style={{ maxWidth: "500px" }}>
                <div className="modal-header">
                    <h3>➕ Nouvelle sous-catégorie</h3>
                    <button className="btn btn-ghost" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
                    <div style={{
                        background: "rgba(139, 92, 246, 0.1)",
                        border: "2px solid rgba(139, 92, 246, 0.3)",
                        borderRadius: "8px",
                        padding: "1rem",
                        marginBottom: "1.5rem"
                    }}>
                        <p style={{ margin: 0, fontSize: "0.875rem", color: "#c4b5fd" }}>
                            <strong>Catégorie parent :</strong> {categoryName}
                        </p>
                    </div>

                    <div style={{ marginBottom: "2rem" }}>
                        <label className="label">Nom de la sous-catégorie *</label>
                        <input
                            type="text"
                            className="ui-input"
                            placeholder="Ex: Échanges Erasmus"
                            value={subcategoryName}
                            onChange={(e) => setSubcategoryName(e.target.value)}
                            maxLength={50}
                            required
                            autoFocus
                        />
                        <small style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                            Maximum 50 caractères
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
                            ℹ️ <strong>Note :</strong> Les sous-catégories sont créées instantanément sans validation admin.
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
                                background: submitting ? "#64748b" : "linear-gradient(135deg, #667eea, #764ba2)",
                                opacity: submitting ? 0.6 : 1
                            }}
                        >
                            {submitting ? "Création..." : "✨ Créer"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
