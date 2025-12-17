// src/components/NewPostForm.jsx
import { useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
import { useAuth } from "../auth/AuthContext";
import { CATEGORIES } from "../constants/categories";
import useUserProfile from "../hooks/useUserProfile";
import PostPreview from "./PostPreview";
import CancelAlertModal from "./CancelAlertModal";

export default function NewPostForm({ fixedCategory = null, onSuccess }) {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(
    fixedCategory || (CATEGORIES[0]?.name || CATEGORIES[0])
  );
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [busy, setBusy] = useState(false);

  // New features
  const [attachments, setAttachments] = useState([]);
  const [isPreview, setIsPreview] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [subcategory, setSubcategory] = useState("blog");
  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState("fr");
  const [postType, setPostType] = useState("article");
  const [status, setStatus] = useState("draft");

  // Track if there are unsaved changes
  const hasChanges = title.trim() || content.trim() || file || attachments.length > 0;

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
      let mediaUrl = "";
      if (file) {
        const fileRef = ref(storage, `posts/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        mediaUrl = await getDownloadURL(fileRef);
      }
      // Upload attachments
      const attachmentUrls = [];
      for (const attachment of attachments) {
        const attachRef = ref(storage, `attachments/${user.uid}/${Date.now()}_${attachment.name}`);
        await uploadBytes(attachRef, attachment);
        const url = await getDownloadURL(attachRef);
        attachmentUrls.push({
          name: attachment.name,
          url,
          size: attachment.size,
          type: attachment.type
        });
      }

      const authorName = profile?.fullName || user.displayName || user.email || "Utilisateur";
      await addDoc(collection(db, "posts"), {
        title: title.trim(),
        content: content.trim(),
        category,
        subcategory,
        location,
        language,
        postType,
        status,
        mediaUrl,
        mediaType: file ? mediaType : null,
        attachments: attachmentUrls,
        authorId: user.uid,
        authorName,
        authorNameLower: authorName.toLowerCase(),
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setContent("");
      setFile(null);
      setAttachments([]);
      onSuccess?.();
    } catch (e) {
      console.error(e);
      alert("Error creating post");
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

  const handleFileAttachment = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <>
      <form className="card form" onSubmit={handleSubmit}>
        <div className="modal-header" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <h3>{isPreview ? "👁️ Aperçu" : "Create a post"}</h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? "✏️ Éditer" : "👁️ Aperçu"}
            </button>
            <button type="button" className="btn-ghost" onClick={handleClose}>
              ✕
            </button>
          </div>
        </div>

        {isPreview ? (
          <PostPreview
            title={title}
            content={content}
            category={category}
            mediaUrl={file ? URL.createObjectURL(file) : ""}
            mediaType={mediaType}
            attachments={attachments}
          />
        ) : (
          <>
            <label>Title
              <input
                className="ui-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your title"
                required
              />
            </label>

            {!fixedCategory && (
              <label>Category
                <select
                  className="ui-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
              </label>
            )}
            {fixedCategory && (
              <div className="badge" style={{ marginBottom: 8 }}>
                {fixedCategory}
              </div>
            )}

            {/* New categorization fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <label>Type
                <select className="ui-select" value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
                  <option value="blog">Blog</option>
                  <option value="journalism">Journalism</option>
                </select>
              </label>

              <label>Article Type
                <select className="ui-select" value={postType} onChange={(e) => setPostType(e.target.value)}>
                  <option value="article">Article</option>
                  <option value="essay">Essay</option>
                  <option value="opinion">Opinion</option>
                  <option value="review">Review</option>
                </select>
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <label>Language
                <select className="ui-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="es">🇪🇸 Español</option>
                  <option value="de">🇩🇪 Deutsch</option>
                  <option value="it">🇮🇹 Italiano</option>
                </select>
              </label>

              <label>Location
                <select className="ui-select" value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="">Select location...</option>
                  <option value="Paris Campus">Paris Campus</option>
                  <option value="Lyon Campus">Lyon Campus</option>
                  <option value="Madrid">Madrid</option>
                  <option value="Barcelona">Barcelona</option>
                  <option value="Online">Online</option>
                </select>
              </label>
            </div>

            <label>Content
              <textarea
                className="ui-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Say something"
                rows={4}
                required
              />
            </label>

            <label>Media (optional)
              <select
                className="ui-select"
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <input
                type="file"
                accept={mediaType === "image" ? "image/*" : "video/*"}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            {/* File attachments */}
            <label>Attachments (PDF, Word)
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                onChange={handleFileAttachment}
              />
            </label>

            {attachments.length > 0 && (
              <div style={{ background: "#f9f9f9", padding: "12px", borderRadius: "12px", marginTop: "8px" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "var(--muted)" }}>
                  📎 Fichiers joints ({attachments.length})
                </div>
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      fontSize: "14px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>📄</span>
                      <span>{file.name}</span>
                      <span style={{ color: "var(--muted)", fontSize: "12px" }}>
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "18px",
                        color: "var(--muted)"
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label>Status
              <select className="ui-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">📝 Draft</option>
                <option value="pending">⏳ Pending Validation</option>
              </select>
            </label>
          </>
        )}

        <button className="btn" disabled={busy} type="submit">
          {busy ? "Posting…" : "Post"}
        </button>
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

