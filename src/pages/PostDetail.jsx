// src/pages/PostDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, setDoc, getDoc as getDocSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthContext';
import ReportModal from '../components/ReportModal';
import '../styles/PostDetail.css';

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Charger le post
  useEffect(() => {
    if (!postId) return;

    const postRef = doc(db, 'posts', postId);
    const unsubPost = onSnapshot(postRef, (docSnap) => {
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() });
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => unsubPost();
  }, [postId]);

  // Charger les likes
  useEffect(() => {
    if (!postId) return;

    const likesCol = collection(db, 'posts', postId, 'likes');
    const unsubLikes = onSnapshot(likesCol, (snap) => {
      setLikeCount(snap.size);
      if (user) setLiked(snap.docs.some((d) => d.id === user.uid));
    });

    return () => unsubLikes();
  }, [postId, user]);

  // Charger les commentaires
  useEffect(() => {
    if (!postId) return;

    const commentsCol = collection(db, 'posts', postId, 'comments');
    const unsubComments = onSnapshot(
      query(commentsCol, orderBy('createdAt', 'asc')),
      (snap) => {
        setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    return () => unsubComments();
  }, [postId]);

  const handleLike = async () => {
    if (!user) return alert('Connectez-vous pour liker');
    const likeRef = doc(db, 'posts', postId, 'likes', user.uid);
    const snap = await getDocSnapshot(likeRef);
    if (snap.exists()) {
      await deleteDoc(likeRef);
    } else {
      await setDoc(likeRef, { createdAt: serverTimestamp() });
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return alert('Connectez-vous pour commenter');
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        text: commentText.trim(),
        authorId: user.uid,
        authorName: user.displayName || user.email,
        createdAt: serverTimestamp(),
      });
      setCommentText('');
    } catch (e) {
      console.error(e);
      alert('Erreur lors du commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-post">Chargement du post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container">
        <div className="post-not-found">
          <h2>Post non trouvé</h2>
          <p>Le post que vous cherchez n'existe pas ou a été supprimé.</p>
          <Link to="/forum" className="btn">← Retour au forum</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container post-detail-container">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Retour
      </button>

      <article className="post-detail">
        <div className="post-detail-header">
          <div className="post-meta">
            <span className="post-author">{post.authorName}</span>
            <span className="dot">•</span>
            <span className="post-category-badge">{post.category}</span>
            <span className="dot">•</span>
            <span className="post-date">
              {post.createdAt?.toDate?.()?.toLocaleDateString?.('fr-FR') || 'Récemment'}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h1 className="post-detail-title">{post.title}</h1>
            <button 
              onClick={() => setShowReportModal(true)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "none",
                color: "#94a3b8",
                fontSize: "1.25rem",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                flexShrink: 0,
                marginLeft: "1rem"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
              title="Signaler ce post"
            >
              ⋮
            </button>
          </div>
        </div>

        {post.mediaUrl && (
          <div className="post-detail-media">
            {post.mediaType === 'video' ? (
              <video controls src={post.mediaUrl} />
            ) : (
              <img src={post.mediaUrl} alt={post.title} />
            )}
          </div>
        )}

        <div className="post-detail-content">
          <p>{post.content}</p>
        </div>

        {/* Affichage des fichiers multiples */}
        {post.files && post.files.length > 0 && (
          <div style={{ 
            marginTop: "1.5rem", 
            padding: "1.5rem", 
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", 
            borderRadius: "16px",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ 
              fontSize: "1rem", 
              fontWeight: "700", 
              marginBottom: "1rem", 
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <span>📁</span>
              Fichiers joints ({post.files.length})
            </div>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
              gap: "1rem" 
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
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      overflow: "hidden",
                      textDecoration: "none",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      display: "block",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                      e.currentTarget.style.transform = "translateY(-4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {file.type === 'image' ? (
                      <div style={{
                        width: "100%",
                        height: "150px",
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
                        height: "150px",
                        overflow: "hidden",
                        background: "#000",
                        position: "relative"
                      }}>
                        <video
                          src={file.url}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                        />
                        <div style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          fontSize: "3rem",
                          color: "white",
                          opacity: 0.8
                        }}>
                          ▶
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "150px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        fontSize: "4rem"
                      }}>
                        {getFileIcon(file.type)}
                      </div>
                    )}
                    <div style={{ padding: "1rem" }}>
                      <div style={{ 
                        fontSize: "0.875rem",
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
                        fontSize: "0.75rem",
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}>
                        <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <span>•</span>
                        <span style={{ 
                          textTransform: "uppercase",
                          fontWeight: "600",
                          fontSize: "0.7rem"
                        }}>
                          {file.type}
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <div className="post-detail-actions">
          <button
            className={`action-btn ${liked ? 'active' : ''}`}
            onClick={handleLike}
          >
            👍 {likeCount} Like{likeCount !== 1 ? 's' : ''}
          </button>
          <button className="action-btn">
            💬 {comments.length} Commentaire{comments.length !== 1 ? 's' : ''}
          </button>
        </div>

        <div className="comments-section">
          <h2>Commentaires ({comments.length})</h2>

          {user && (
            <form className="comment-form" onSubmit={handleComment}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Écrivez un commentaire..."
                rows="3"
                className="ui-input"
              />
              <button
                className="btn"
                type="submit"
                disabled={submitting || !commentText.trim()}
              >
                {submitting ? 'Envoi...' : 'Commenter'}
              </button>
            </form>
          )}

          {!user && (
            <div className="login-prompt">
              <p>Connectez-vous pour commenter</p>
              <Link to="/login" className="btn">Se connecter</Link>
            </div>
          )}

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">Aucun commentaire pour le moment. Soyez le premier !</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">{comment.authorName}</span>
                    <span className="comment-date">
                      {comment.createdAt?.toDate?.()?.toLocaleDateString?.('fr-FR') || 'Récemment'}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </article>
      
      {showReportModal && (
        <ReportModal 
          postId={post.id} 
          onClose={() => setShowReportModal(false)} 
        />
      )}
    </div>
  );
}
