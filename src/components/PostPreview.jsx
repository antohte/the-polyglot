// src/components/PostPreview.jsx
export default function PostPreview({ title, content, category, mediaUrl, mediaType, attachments }) {
    return (
        <div className="post" style={{ cursor: "default", margin: "16px 0" }}>
            <div className="post-header">
                <div className="post-topline">
                    <span className="post-author">Aperçu</span>
                    <span className="dot">•</span>
                    <span className="post-category">{category}</span>
                </div>
                <h2 className="post-title">{title || "Sans titre"}</h2>
            </div>

            {mediaUrl && (
                <>
                    {mediaType === "image" ? (
                        <img src={mediaUrl} alt="Media" className="media" />
                    ) : (
                        <video src={mediaUrl} controls className="media" />
                    )}
                </>
            )}

            <div className="content" style={{ whiteSpace: "pre-wrap" }}>
                {content || "Aucun contenu..."}
            </div>

            {attachments && attachments.length > 0 && (
                <div style={{ marginTop: "12px", padding: "12px", background: "#f9f9f9", borderRadius: "12px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "var(--muted)" }}>
                        📎 Fichiers joints ({attachments.length})
                    </div>
                    {attachments.map((file, idx) => (
                        <div
                            key={idx}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "6px 0",
                                fontSize: "14px",
                                color: "var(--text)"
                            }}
                        >
                            <span>📄</span>
                            <span>{file.name}</span>
                            <span style={{ color: "var(--muted)", fontSize: "12px" }}>
                                ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
