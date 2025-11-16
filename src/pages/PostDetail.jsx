// src/pages/PostDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, setDoc, getDoc as getDocSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthContext';
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
          <h1 className="post-detail-title">{post.title}</h1>
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
    </div>
  );
}
