// src/components/PostCard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function PostCard({ post }) {
  const { user } = useAuth();
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
    if (!user) return alert("Vous devez être connecté pour liker.");
    try {
      // Optimistic UI
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);

      const res = await api.posts.toggleLike(post.id, user.uid);

      // Re-sync if needed, but response gave us boolean
      setLiked(res.liked);
      // Fetch count again to be sure? Or trust logic. 
      // Let's trust optimistic for now, or fetch count in background.
    } catch (err) {
      console.error("Error toggling like:", err);
      // Revert on error
      setLiked(liked);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
    }
  }

  async function addComment(e) {
    e.preventDefault();
    if (!user) return alert("Vous devez être connecté pour commenter.");
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
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Erreur lors de l'ajout du commentaire");
    }
  }

  return (
    <article className="post">
      <Link to={`/post/${post.id}`} className="post-link-overlay" />

      <div className="post-header">
        <div className="post-topline">
          <span className="post-author">{post.author_name || "Anonyme"}</span>
          <span className="dot">•</span>
          <span className="post-category">{post.category_slug || "Général"}</span>
        </div>

        <h3 className="post-title">{post.title}</h3>
      </div>

      {post.image_url && (
        <img className="media" src={post.image_url} alt="media" />
      )}

      <p className="content">{post.content}</p>

      {/* Legacy/Future File Support Placeholder */}
      {/* {post.files && ... } */}

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
