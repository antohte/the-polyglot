// src/pages/PostDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
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

  // Charger les données
  useEffect(() => {
    let mounted = true;
    if (!postId) return;

    async function loadData() {
      try {
        // Load Post
        const postData = await api.posts.get(postId);
        if (mounted) {
          setPost(postData);

          // Load Likes
          const likesData = await api.posts.getLikes(postId);
          setLikeCount(likesData.count);
          if (user && likesData.user_ids.includes(user.uid)) {
            setLiked(true);
          }

          // Load Comments
          const commentsData = await api.posts.getComments(postId);
          setComments(commentsData);
        }
      } catch (err) {
        console.error("Error loading post details:", err);
        // Assuming 404 sets post to null, handled by render
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => { mounted = false; };
  }, [postId, user]);

  const handleLike = async () => {
    if (!user) return alert('Connectez-vous pour liker');
    try {
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
      const res = await api.posts.toggleLike(postId, user.uid);
      setLiked(res.liked);
    } catch (err) {
      console.error("Error toggling like:", err);
      setLiked(liked);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return alert('Connectez-vous pour commenter');
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const newComment = {
        id: crypto.randomUUID(),
        author_id: user.uid,
        content: commentText.trim()
      };

      const addedComment = await api.posts.addComment(postId, newComment);
      setComments([...comments, addedComment]);
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

      <article className="post-detail-card glass-panel">
        <div className="post-header-section">
          <div className="post-meta-top">
            <div className="post-author-lockup">
              <div className="author-avatar-large">
                {post.author_name ? post.author_name[0].toUpperCase() : "A"}
              </div>
              <div className="author-details">
                <span className="author-name-large">{post.author_name || "Anonyme"}</span>
                <span className="post-date-large">{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

            <div className="header-actions">
              <span className="post-category-tag">{post.category_slug || "Général"}</span>
              <button
                onClick={() => setShowReportModal(true)}
                className="btn-icon-ghost"
                title="Signaler ce post"
              >
                ⋮
              </button>
            </div>
          </div>

          <h1 className="post-title-large">{post.title}</h1>
        </div>

        {post.image_url && (
          <div className="post-media-container">
            <img src={post.image_url} alt={post.title} />
          </div>
        )}

        <div className="post-content-body">
          <p>{post.content}</p>
        </div>

        <div className="post-actions-bar">
          <button
            className={`action-pill ${liked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            {liked ? '❤️' : '🤍'} <span>{likeCount} J'aime</span>
          </button>

          <button className="action-pill static">
            💬 <span>{comments.length} Commentaires</span>
          </button>
        </div>

        <div className="card-divider"></div>

        <section className="internal-comments-section">
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
                className="btn-primary-gradient"
                type="submit"
                disabled={submitting || !commentText.trim()}
              >
                {submitting ? 'Envoi...' : 'Publier'}
              </button>
            </form>
          )}

          {!user && (
            <div className="login-prompt">
              <p>Connectez-vous pour commenter</p>
              <Link to="/login" className="btn-primary-gradient">Se connecter</Link>
            </div>
          )}

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">Aucun commentaire pour le moment. Soyez le premier !</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">{comment.author_name}</span>
                    <span className="comment-date">
                      {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </section>
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
