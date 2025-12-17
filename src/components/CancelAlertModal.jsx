// src/components/CancelAlertModal.jsx
export default function CancelAlertModal({ show, onCancel, onConfirm }) {
    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop" onClick={onCancel} />
            <div className="modal-panel" style={{ maxWidth: "480px" }}>
                <div className="modal-header">
                    <h3>⚠️ Modifications non sauvegardées</h3>
                    <button className="btn-ghost" onClick={onCancel}>
                        ✕
                    </button>
                </div>

                <div style={{ padding: "16px 0" }}>
                    <p style={{ color: "var(--muted)", lineHeight: "1.6", margin: "0 0 16px" }}>
                        Vous avez des modifications non sauvegardées. Si vous quittez maintenant,
                        ces modifications seront perdues.
                    </p>
                    <p style={{ color: "var(--text)", fontWeight: "600", margin: 0 }}>
                        Êtes-vous sûr de vouloir quitter ?
                    </p>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button className="btn-ghost" onClick={onCancel}>
                        Continuer l'édition
                    </button>
                    <button
                        className="btn"
                        style={{ background: "#dc2626", color: "#fff" }}
                        onClick={onConfirm}
                    >
                        Quitter sans sauvegarder
                    </button>
                </div>
            </div>
        </>
    );
}
