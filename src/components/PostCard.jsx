// src/components/PostCard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  doc,
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthContext";

export default function PostCard({ post }) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Ecoutes temps réel (likes + commentaires)
  useEffect(() => {
    const likesCol = collection(db, "posts", post.id, "likes");
    const unsubLikes = onSnapshot(likesCol, (snap) => {
      setLikeCount(snap.size);
      if (user) setLiked(snap.docs.some((d) => d.id === user.uid));
    });

    const commentsCol = collection(db, "posts", post.id, "comments");
    const unsubComments = onSnapshot(
      query(commentsCol, orderBy("createdAt", "asc")),
      (snap) => {
        setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    return () => {
      unsubLikes();
      unsubComments();
    };
  }, [post.id, user]);

  async function toggleLike() {
    if (!user) return alert("Vous devez être connecté pour liker. Cliquez sur Login en haut à droite.");
    const likeRef = doc(db, "posts", post.id, "likes", user.uid);
    const snap = await getDoc(likeRef);
    if (snap.exists()) await deleteDoc(likeRef);
    else await setDoc(likeRef, { createdAt: serverTimestamp() });
  }

  async function addComment(e) {
    e.preventDefault();
    if (!user) return alert("Vous devez être connecté pour commenter. Cliquez sur Login en haut à droite.");
    if (!commentText.trim()) return;
    await addDoc(collection(db, "posts", post.id, "comments"), {
      text: commentText.trim(),
      authorId: user.uid,
      authorName: user.displayName || user.email,
      createdAt: serverTimestamp(),
    });
    setCommentText("");
  }

  return (
    <article className="post">
      <Link to={`/post/${post.id}`} className="post-link-overlay" />
      
      <div className="post-header">
        <div className="post-topline">
          <span className="post-author">{post.authorName}</span>
          <span className="dot">•</span>
          <span className="post-category">{post.category}</span>
          {post.status && (
            <>
              <span className="dot">•</span>
              <span className={`badge status-${post.status}`}>
                {post.status === 'draft' ? '📝 Draft' :
                  post.status === 'pending' ? '⏳ Pending' :
                    '✅ Validated'}
              </span>
            </>
          )}
          {post.language && (
            <>
              <span className="dot">•</span>
              <span className="badge">{post.language.toUpperCase()}</span>
            </>
          )}
        </div>

        <h3 className="post-title">{post.title}</h3>
      </div>

      {post.mediaUrl &&
        (post.mediaType === "video" ? (
          <video className="media" src={post.mediaUrl} controls />
        ) : (
          <img className="media" src={post.mediaUrl} alt="media" />
        ))}

      <p className="content">{post.content}</p>

      {/* Affichage des fichiers multiples */}
      {post.files && post.files.length > 0 && (
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
            Fichiers joints ({post.files.length})
          </div>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", 
            gap: "0.75rem" 
          }}>
            {post.files.map((file, idx) => {
              const getFileIcon = (type) => {
                if (type === 'image') return '🖼️';
                if (type === 'video') return '🎥';
                if (type === 'pdf') return '📕';
                if (type === 'document') return '📘';
                return '📄';
              };

              return (
                <a
                  key={idx}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    display: "block",
                    position: "relative",
                    zIndex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {file.type === 'image' ? (
                    <div style={{
                      width: "100%",
                      height: "100px",
                      overflow: "hidden",
                      background: "#f8fafc"
                    }}>
                      <img 
                        src={file.url} 
                        alt={file.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />
                    </div>
                  ) : file.type === 'video' ? (
                    <div style={{
                      width: "100%",
                      height: "100px",
                      overflow: "hidden",
                      background: "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem"
                    }}>
                      🎥
                    </div>
                  ) : (
                    <div style={{
                      width: "100%",
                      height: "100px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      fontSize: "2.5rem"
                    }}>
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  <div style={{ padding: "0.5rem" }}>
                    <div style={{ 
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      color: "#1e293b",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: "0.125rem"
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
                </a>
              );
            })}
          </div>
        </div>
      )}

      <div className="actions">
        <button className={`btn like-btn ${liked ? "active" : ""}`} onClick={toggleLike}>
          👍 {likeCount}
        </button>
        <Link to={`/post/${post.id}`} className="btn">
          💬 {comments.length}
        </Link>
      </div>

      <div className="comments" style={{ display: 'none' }}>
        {comments.map((c) => (
          <div key={c.id} className="comment">
            <span className="comment-author">{c.authorName}</span>
            <span className="comment-text">{c.text}</span>
          </div>
        ))}
      </div>

      <form className="comment-form" style={{ display: 'none' }} onSubmit={addComment}>
        <input
          type="text"
          className="ui-input"
          placeholder="Write a comment…"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button className="btn" type="submit">
          Comment
        </button>
      </form>
    </article>
  );
}
