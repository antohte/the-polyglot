import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "./Toast";
import "../styles/PostCard.css";

export default function PostCard({ post }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Load likes and comments
  useEffect(() => {
    let mounted = true;

    async function loadInteractions() {
      try {
        // Load likes
        const likesData = await api.posts.getLikes(post.id);
        if (mounted) {
          setLikeCount(likesData.count);
          if (user && likesData.user_ids.includes(user.uid)) {
            setLiked(true);
          }
        }

        // Load comments
        const commentsData = await api.posts.getComments(post.id);
        if (mounted) {
          setComments(commentsData);
        }
      } catch (err) {
        console.error("Error loading interactions for post", post.id, err);
      }
    }

    loadInteractions();

    return () => { mounted = false; };
  }, [post.id, user]);

  async function toggleLike() {
    if (!user) return addToast("Vous devez être connecté pour liker.", "error");
    try {
      // Optimistic UI
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);

      const res = await api.posts.toggleLike(post.id, user.uid);

      // Re-sync if needed, but response gave us boolean
      setLiked(res.liked);
    } catch (err) {
      console.error("Error toggling like:", err);
      // Revert on error
      setLiked(liked);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
      addToast("Erreur lors du like", "error");
    }
  }

  async function addComment(e) {
    e.preventDefault();
    if (!user) return addToast("Vous devez être connecté pour commenter.", "error");
    if (!commentText.trim()) return;

    try {
      const newComment = {
        id: crypto.randomUUID(),
        author_id: user.uid,
        content: commentText.trim()
      };

      const addedComment = await api.posts.addComment(post.id, newComment);

      setComments([...comments, addedComment]);
      setCommentText("");
      addToast("Commentaire ajouté !", "success");
    } catch (err) {
      console.error("Error adding comment:", err);
      addToast("Erreur lors de l'ajout du commentaire", "error");
    }
  }

  return (
    <article className="postcard">
      <Link to={`/post/${post.id}`} className="postcard-link-overlay" />

      <div className="postcard-header">
        <div className="postcard-meta-top">
          <div className="postcard-author-info">
            <div className="postcard-avatar-placeholder">
              {post.author_name ? post.author_name[0].toUpperCase() : "A"}
            </div>
            <div className="postcard-author-text">
              <span className="postcard-author-name">{post.author_name || "Anonyme"}</span>
              <span className="postcard-date">{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
          {post.category_slug && (
            <span className="postcard-category-pill">{post.category_slug}</span>
          )}
        </div>

        <h3 className="postcard-title">{post.title}</h3>
      </div>

      <p className="postcard-content">{post.content}</p>

      {post.image_url && (
        <img className="postcard-media" src={post.image_url} alt="media" />
      )}

      {/* Legacy/Future File Support Placeholder */}
      {/* {post.files && ... } */}

      <div className="postcard-actions">
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
            <span className="comment-author">{c.author_name}</span>
            <span className="comment-text">{c.content}</span>
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
