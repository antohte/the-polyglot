// src/components/PostPreview.jsx
export default function PostPreview({ title, content, category, files = [] }) {
    const getFileIcon = (file) => {
        if (file.type?.startsWith('image/')) return '🖼️';
        if (file.type?.startsWith('video/')) return '🎥';
        if (file.type === 'application/pdf') return '📕';
        if (file.type?.includes('word') || file.name?.endsWith('.doc') || file.name?.endsWith('.docx')) return '📘';
        return '📄';
    };

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

            <div className="content" style={{ whiteSpace: "pre-wrap" }}>
                {content || "Aucun contenu..."}
            </div>

            {files && files.length > 0 && (
                <div style={{ 
                    marginTop: "1rem", 
                    padding: "1rem", 
                    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", 
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0"
                }}>
                    <div style={{ 
                        fontSize: "0.875rem", 
                        fontWeight: "700", 
                        marginBottom: "0.75rem", 
                        color: "#334155",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                    }}>
                        <span>📁</span>
                        Fichiers joints ({files.length})
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
                        {files.map((file, idx) => {
                            const isImage = file.type?.startsWith('image/');
                            const isVideo = file.type?.startsWith('video/');
                            const previewUrl = isImage || isVideo ? URL.createObjectURL(file) : null;

                            return (
                                <div
                                    key={idx}
                                    style={{
                                        background: "#ffffff",
                                        borderRadius: "8px",
                                        border: "1px solid #e2e8f0",
                                        overflow: "hidden",
                                        transition: "all 0.2s ease"
                                    }}
                                >
                                    {previewUrl && isImage && (
                                        <div style={{
                                            width: "100%",
                                            height: "120px",
                                            overflow: "hidden",
                                            background: "#f8fafc"
                                        }}>
                                            <img 
                                                src={previewUrl} 
                                                alt={file.name}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover"
                                                }}
                                            />
                                        </div>
                                    )}
                                    {previewUrl && isVideo && (
                                        <div style={{
                                            width: "100%",
                                            height: "120px",
                                            overflow: "hidden",
                                            background: "#000"
                                        }}>
                                            <video 
                                                src={previewUrl}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover"
                                                }}
                                            />
                                        </div>
                                    )}
                                    {!previewUrl && (
                                        <div style={{
                                            width: "100%",
                                            height: "120px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                            fontSize: "3rem"
                                        }}>
                                            {getFileIcon(file)}
                                        </div>
                                    )}
                                    <div style={{ padding: "0.75rem" }}>
                                        <div style={{ 
                                            fontSize: "0.75rem",
                                            fontWeight: "600",
                                            color: "#1e293b",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            marginBottom: "0.25rem"
                                        }}>
                                            {file.name}
                                        </div>
                                        <div style={{ 
                                            fontSize: "0.65rem",
                                            color: "#64748b"
                                        }}>
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
