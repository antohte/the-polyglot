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
            <div className="modal-panel glass-card" role="dialog" aria-modal="true">
                <div className="modal-header">
                    <h3>📁 Proposer une nouvelle catégorie</h3>
                    <button className="btn-icon" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
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
                        <small className="input-hint">
                            Maximum 50 caractères
                        </small>
                    </div>

                    <div className="form-group">
                        <label className="label">Description (optionnel)</label>
                        <textarea
                            className="ui-input"
                            placeholder="Décrivez brièvement le contenu de cette catégorie..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            maxLength={200}
                        />
                        <small className="input-hint">
                            Maximum 200 caractères
                        </small>
                    </div>

                    <div className="alert-info">
                        <p>
                            ℹ️ <strong>Note :</strong> Votre demande sera examinée par un administrateur avant d'être approuvée.
                            Vous serez notifié une fois la décision prise.
                        </p>
                    </div>

                    <div className="modal-actions">
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
                        >
                            {submitting ? "Envoi..." : "📤 Envoyer la demande"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
