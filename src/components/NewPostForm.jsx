// src/components/NewPostForm.jsx
import { useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "./Toast";
import { CATEGORIES } from "../constants/categories";
import useUserProfile from "../hooks/useUserProfile";
import PostPreview from "./PostPreview";
import CancelAlertModal from "./CancelAlertModal";

export default function NewPostForm({ fixedCategory = null, subcategories = [], onSuccess }) {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(
    fixedCategory || (CATEGORIES[0]?.name || CATEGORIES[0])
  );
  const [busy, setBusy] = useState(false);

  // New features
  const [files, setFiles] = useState([]);
  const [isPreview, setIsPreview] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [subcategory, setSubcategory] = useState(
    subcategories && subcategories.length > 0 ? subcategories[0].name : ""
  );
  const [language, setLanguage] = useState("fr");
  const [postType, setPostType] = useState("article");

  // Track if there are unsaved changes
  const hasChanges = title.trim() || content.trim() || files.length > 0;

  if (!user) {
    return (
      <div className="card">
        <p style={{ color: "var(--muted)", marginBottom: "15px" }}>
          Vous devez être connecté pour créer un post.
        </p>
        <button className="btn" onClick={() => navigate("/login")}>
          Se connecter
        </button>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      // Upload all files
      const uploadedFiles = [];
      for (const file of files) {
        const fileRef = ref(storage, `posts/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        
        // Déterminer le type de fichier
        let fileType = 'other';
        if (file.type.startsWith('image/')) fileType = 'image';
        else if (file.type.startsWith('video/')) fileType = 'video';
        else if (file.type === 'application/pdf') fileType = 'pdf';
        else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) fileType = 'document';
        
        uploadedFiles.push({
          name: file.name,
          url,
          size: file.size,
          type: fileType,
          mimeType: file.type
        });
      }

      const authorName = profile?.fullName || user.displayName || user.email || "Utilisateur";
      
      await addDoc(collection(db, "posts"), {
        title: title.trim(),
        content: content.trim(),
        category,
        subcategory,
        language,
        postType,
        status: "published",
        files: uploadedFiles,
        authorId: user.uid,
        authorName,
        authorNameLower: authorName.toLowerCase(),
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setContent("");
      setFiles([]);
      addToast("Post créé avec succès", "success");
      onSuccess?.();
    } catch (e) {
      console.error(e);
      addToast("Erreur lors de la création du post", "error");
    } finally {
      setBusy(false);
    }
  }

  const handleClose = () => {
    if (hasChanges) {
      setShowCancelAlert(true);
    } else {
      onSuccess?.();
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type.startsWith('video/')) return '🎥';
    if (file.type === 'application/pdf') return '📕';
    if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) return '📘';
    return '📄';
  };

  return (
    <>
      <form 
        className="card form" 
        onSubmit={handleSubmit}
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          border: "1px solid rgba(102, 126, 234, 0.3)",
          borderRadius: "20px",
          padding: 0,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(102, 126, 234, 0.1) inset",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{ 
          position: "sticky", 
          top: 0, 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          zIndex: 10,
          padding: "1.5rem 2rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              backdropFilter: "blur(10px)"
            }}>
              {isPreview ? "👁️" : "✍️"}
            </div>
            <div>
              <h3 style={{ 
                margin: 0, 
                color: "#ffffff", 
                fontSize: "1.5rem",
                fontWeight: "700",
                textShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}>
                {isPreview ? "Aperçu du post" : "Créer un nouveau post"}
              </h3>
              <p style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "rgba(255, 255, 255, 0.8)",
                marginTop: "0.25rem"
              }}>
                {isPreview ? "Vérifiez votre contenu avant de publier" : "Partagez vos idées avec la communauté"}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "10px",
                padding: "0.75rem 1.25rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.3)";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{isPreview ? "✏️" : "👁️"}</span>
              {isPreview ? "Éditer" : "Aperçu"}
            </button>
            <button 
              type="button" 
              onClick={handleClose}
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "10px",
                padding: "0.75rem 1rem",
                cursor: "pointer",
                fontSize: "1.25rem",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                width: "44px",
                height: "44px"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(239, 68, 68, 0.3)";
                e.target.style.transform = "rotate(90deg)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(239, 68, 68, 0.2)";
                e.target.style.transform = "rotate(0deg)";
              }}
            >
              ✕
            </button>
          </div>
        </div>

        <div style={{
          padding: "2.5rem",
          overflowY: "auto",
          flex: 1
        }}>
          {isPreview ? (
            <PostPreview
              title={title}
              content={content}
              category={category}
              files={files}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
              {/* SECTION: Informations principales */}
              <div style={{
                padding: "2rem",
                background: "rgba(102, 126, 234, 0.05)",
                borderRadius: "16px",
                border: "1px solid rgba(102, 126, 234, 0.15)"
              }}>
                <h4 style={{
                  margin: "0 0 1.5rem 0",
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#c4b5fd",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <span style={{ fontSize: "1.25rem" }}>📝</span>
                  Informations principales
                </h4>
                
                <div>
                  <label style={{
                    display: "block",
                    marginBottom: "0.75rem",
                    fontWeight: "700",
                    fontSize: "0.875rem",
                    color: "#e2e8f0",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    ✨ Titre du post
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Donnez un titre accrocheur à votre post..."
                    required
                    style={{
                      width: "100%",
                      padding: "1.25rem 1.5rem",
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      border: "2px solid rgba(102, 126, 234, 0.3)",
                      borderRadius: "12px",
                      background: "rgba(15, 23, 42, 0.5)",
                      color: "#f1f5f9",
                      outline: "none",
                      transition: "all 0.3s ease",
                      backdropFilter: "blur(10px)"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#667eea";
                      e.target.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(102, 126, 234, 0.3)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                {fixedCategory ? (
                  <div style={{
                    marginTop: "1.5rem",
                    padding: "1rem 1.5rem",
                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)",
                    border: "1px solid rgba(102, 126, 234, 0.4)",
                    borderRadius: "12px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    color: "#c4b5fd",
                    width: "fit-content"
                  }}>
                    📁 {fixedCategory}
                  </div>
                ) : (
                  <div style={{ marginTop: "1.5rem" }}>
                    <label style={{
                      display: "block",
                      marginBottom: "0.75rem",
                      fontWeight: "700",
                      fontSize: "0.875rem",
                      color: "#e2e8f0",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>
                      📁 Catégorie
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "1.25rem 1.5rem",
                        fontSize: "1rem",
                        border: "2px solid rgba(102, 126, 234, 0.3)",
                        borderRadius: "12px",
                        background: "rgba(15, 23, 42, 0.5)",
                        color: "#f1f5f9",
                        outline: "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(10px)"
                      }}
                    >
                      {CATEGORIES.map((c) => {
                        const name = c.name ?? c;
                        return (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              {/* SECTION: Classification */}
              <div style={{
                padding: "2rem",
                background: "rgba(102, 126, 234, 0.05)",
                borderRadius: "16px",
                border: "1px solid rgba(102, 126, 234, 0.15)"
              }}>
                <h4 style={{
                  margin: "0 0 1.5rem 0",
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#c4b5fd",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <span style={{ fontSize: "1.25rem" }}>🏷️</span>
                  Classification
                </h4>

                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "1.5rem" 
                }}>
                  {subcategories && subcategories.length > 0 ? (
                    <div>
                      <label style={{
                        display: "block",
                        marginBottom: "0.75rem",
                        fontWeight: "700",
                        fontSize: "0.875rem",
                        color: "#e2e8f0",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        📂 Sous-catégorie
                      </label>
                      <select 
                        value={subcategory} 
                        onChange={(e) => setSubcategory(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "1.25rem 1.5rem",
                          fontSize: "1rem",
                          border: "2px solid rgba(102, 126, 234, 0.3)",
                          borderRadius: "12px",
                          background: "rgba(15, 23, 42, 0.5)",
                          color: "#f1f5f9",
                          outline: "none",
                          cursor: "pointer",
                          transition: "all 0.3s ease"
                        }}
                      >
                        {subcategories.map((sub) => (
                          <option key={sub.slug} value={sub.name}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label style={{
                        display: "block",
                        marginBottom: "0.75rem",
                        fontWeight: "700",
                        fontSize: "0.875rem",
                        color: "#e2e8f0",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        📂 Type
                      </label>
                      <select 
                        value={subcategory} 
                        onChange={(e) => setSubcategory(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "1.25rem 1.5rem",
                          fontSize: "1rem",
                          border: "2px solid rgba(102, 126, 234, 0.3)",
                          borderRadius: "12px",
                          background: "rgba(15, 23, 42, 0.5)",
                          color: "#f1f5f9",
                          outline: "none",
                          cursor: "pointer",
                          transition: "all 0.3s ease"
                        }}
                      >
                        <option value="blog">Blog</option>
                        <option value="journalism">Journalism</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label style={{
                      display: "block",
                      marginBottom: "0.75rem",
                      fontWeight: "700",
                      fontSize: "0.875rem",
                      color: "#e2e8f0",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>
                      📝 Type d'article
                    </label>
                    <select 
                      value={postType} 
                      onChange={(e) => setPostType(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "1.25rem 1.5rem",
                        fontSize: "1rem",
                        border: "2px solid rgba(102, 126, 234, 0.3)",
                        borderRadius: "12px",
                        background: "rgba(15, 23, 42, 0.5)",
                        color: "#f1f5f9",
                        outline: "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                    >
                      <option value="article">Article</option>
                      <option value="essay">Essai</option>
                      <option value="opinion">Opinion</option>
                      <option value="review">Critique</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION: Contenu */}
              <div style={{
                padding: "2rem",
                background: "rgba(102, 126, 234, 0.05)",
                borderRadius: "16px",
                border: "1px solid rgba(102, 126, 234, 0.15)"
              }}>
                <h4 style={{
                  margin: "0 0 1.5rem 0",
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#c4b5fd",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <span style={{ fontSize: "1.25rem" }}>💭</span>
                  Contenu
                </h4>

                <div>
                  <label style={{
                    display: "block",
                    marginBottom: "0.75rem",
                    fontWeight: "700",
                    fontSize: "0.875rem",
                    color: "#e2e8f0",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    ✍️ Rédigez votre message
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Partagez vos pensées, idées, expériences...&#10;&#10;Soyez créatif et authentique !"
                    rows={8}
                    required
                    style={{
                      width: "100%",
                      padding: "1.25rem 1.5rem",
                      fontSize: "1rem",
                      lineHeight: "1.7",
                      border: "2px solid rgba(102, 126, 234, 0.3)",
                      borderRadius: "12px",
                      background: "rgba(15, 23, 42, 0.5)",
                      color: "#f1f5f9",
                      outline: "none",
                      resize: "vertical",
                      minHeight: "200px",
                      transition: "all 0.3s ease",
                      backdropFilter: "blur(10px)",
                      fontFamily: "inherit"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#667eea";
                      e.target.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(102, 126, 234, 0.3)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* SECTION: Fichiers */}
              <div style={{
                padding: "2rem",
                background: "rgba(102, 126, 234, 0.05)",
                borderRadius: "16px",
                border: "1px solid rgba(102, 126, 234, 0.15)"
              }}>
                <h4 style={{
                  margin: "0 0 1.5rem 0",
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#c4b5fd",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <span style={{ fontSize: "1.25rem" }}>📁</span>
                  Pièces jointes
                </h4>

              <div style={{
                padding: "1.5rem",
                background: "rgba(102, 126, 234, 0.1)",
                border: "2px dashed rgba(102, 126, 234, 0.3)",
                borderRadius: "16px",
                transition: "all 0.3s ease"
              }}>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                  fontWeight: "700",
                  fontSize: "0.875rem",
                  color: "#e2e8f0",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  cursor: "pointer"
                }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
                  }}>
                    📎
                  </div>
                  <div>
                    <div>Fichiers joints</div>
                    <div style={{
                      fontSize: "0.75rem",
                      color: "#94a3b8",
                      textTransform: "none",
                      fontWeight: "400",
                      marginTop: "0.125rem"
                    }}>
                      Images, Vidéos, PDF, Documents...
                    </div>
                  </div>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleFileChange}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    border: "2px solid rgba(102, 126, 234, 0.3)",
                    borderRadius: "10px",
                    cursor: "pointer",
                    background: "rgba(15, 23, 42, 0.5)",
                    color: "#94a3b8",
                    fontSize: "0.875rem",
                    transition: "all 0.3s ease"
                  }}
                />
              </div>

              {files.length > 0 && (
                <div style={{ 
                  background: "rgba(15, 23, 42, 0.5)", 
                  padding: "1.25rem", 
                  borderRadius: "16px", 
                  border: "1px solid rgba(102, 126, 234, 0.3)"
                }}>
                  <div style={{ 
                    fontSize: "0.875rem", 
                    fontWeight: "700", 
                    marginBottom: "1rem", 
                    color: "#e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem"
                    }}>
                      📁
                    </div>
                    Fichiers sélectionnés ({files.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "1rem",
                          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                          borderRadius: "12px",
                          border: "1px solid rgba(102, 126, 234, 0.2)",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)";
                          e.currentTarget.style.borderColor = "rgba(102, 126, 234, 0.4)";
                          e.currentTarget.style.transform = "translateX(4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)";
                          e.currentTarget.style.borderColor = "rgba(102, 126, 234, 0.2)";
                          e.currentTarget.style.transform = "translateX(0)";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: 0 }}>
                          <div style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.5rem",
                            flexShrink: 0,
                            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
                          }}>
                            {getFileIcon(file)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                              fontSize: "0.875rem",
                              fontWeight: "600",
                              color: "#f1f5f9",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              marginBottom: "0.25rem"
                            }}>
                              {file.name}
                            </div>
                            <div style={{ 
                              fontSize: "0.75rem",
                              color: "#94a3b8",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem"
                            }}>
                              <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                              <span>•</span>
                              <span style={{ 
                                padding: "0.125rem 0.5rem",
                                background: "rgba(102, 126, 234, 0.3)",
                                borderRadius: "6px",
                                fontSize: "0.7rem",
                                fontWeight: "600",
                                textTransform: "uppercase"
                              }}>
                                {file.type.split('/')[0]}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          style={{
                            background: "rgba(239, 68, 68, 0.2)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: "10px",
                            padding: "0.5rem 0.875rem",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            color: "#fca5a5",
                            fontWeight: "700",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.375rem"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "rgba(239, 68, 68, 0.3)";
                            e.target.style.borderColor = "rgba(239, 68, 68, 0.5)";
                            e.target.style.color = "#fee2e2";
                            e.target.style.transform = "scale(1.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "rgba(239, 68, 68, 0.2)";
                            e.target.style.borderColor = "rgba(239, 68, 68, 0.3)";
                            e.target.style.color = "#fca5a5";
                            e.target.style.transform = "scale(1)";
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>


            </div>
          )}
        </div>

        <div style={{
          padding: "1.5rem 2rem",
          background: "rgba(15, 23, 42, 0.8)",
          borderTop: "1px solid rgba(102, 126, 234, 0.3)",
          display: "flex",
          gap: "1rem",
          justifyContent: "flex-end",
          position: "sticky",
          bottom: 0,
          backdropFilter: "blur(10px)"
        }}>
          <button 
            type="button"
            onClick={handleClose}
            style={{
              padding: "1rem 2rem",
              fontSize: "1rem",
              fontWeight: "600",
              borderRadius: "12px",
              border: "2px solid rgba(148, 163, 184, 0.3)",
              background: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(148, 163, 184, 0.1)";
              e.target.style.borderColor = "rgba(148, 163, 184, 0.5)";
              e.target.style.color = "#cbd5e1";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
              e.target.style.color = "#94a3b8";
            }}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            disabled={busy}
            style={{
              padding: "1rem 2.5rem",
              fontSize: "1rem",
              fontWeight: "700",
              borderRadius: "12px",
              border: "none",
              background: busy 
                ? "rgba(148, 163, 184, 0.3)" 
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#ffffff",
              cursor: busy ? "not-allowed" : "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: busy 
                ? "none" 
                : "0 8px 24px rgba(102, 126, 234, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              opacity: busy ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!busy) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 12px 32px rgba(102, 126, 234, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (!busy) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 8px 24px rgba(102, 126, 234, 0.4)";
              }
            }}
          >
            {busy ? (
              <>
                <span style={{ 
                  width: "16px", 
                  height: "16px", 
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid #fff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite"
                }}></span>
                Publication...
              </>
            ) : (
              <>
                <span style={{ fontSize: "1.25rem" }}>🚀</span>
                Publier le post
              </>
            )}
          </button>
        </div>
      </form>

      <CancelAlertModal
        show={showCancelAlert}
        onCancel={() => setShowCancelAlert(false)}
        onConfirm={() => {
          setShowCancelAlert(false);
          onSuccess?.();
        }}
      />
    </>
  );
}

