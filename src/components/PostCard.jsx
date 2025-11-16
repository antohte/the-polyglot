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
