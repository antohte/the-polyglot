import { useEffect, useState } from 'react'
const snap = await getDoc(likeRef)
if (snap.exists()) await deleteDoc(likeRef)
else await setDoc(likeRef, { createdAt: serverTimestamp() })


async function addComment(e) {
e.preventDefault()
if (!user) return alert('Please login to comment')
if (!commentText.trim()) return
await addDoc(collection(db, 'posts', post.id, 'comments'), {
text: commentText.trim(),
authorId: user.uid,
authorName: user.displayName || user.email,
createdAt: serverTimestamp()
})
setCommentText('')
}


return (
<article className="post">
<div className="post-header">
<h3>{post.title}</h3>
<span className="meta">{post.category} • {post.authorName}</span>
</div>
{post.mediaUrl && (
post.mediaType === 'video' ? (
<video className="media" src={post.mediaUrl} controls />
) : (
<img className="media" src={post.mediaUrl} alt="media" />
)
)}
<p className="content">{post.content}</p>
<div className="actions">
<button className={`btn ${liked ? 'btn-ghost' : ''}`} onClick={toggleLike}>
❤ {likeCount}
</button>
</div>


<div className="comments">
{comments.map(c => (
<div key={c.id} className="comment">
<span className="comment-author">{c.authorName}</span>
<span className="comment-text">{c.text}</span>
</div>
))}
</div>


<form className="comment-form" onSubmit={addComment}>
<input
type="text"
className="ui-input"
placeholder="Write a comment…"
value={commentText}
onChange={(e) => setCommentText(e.target.value)}
/>
<button className="btn" type="submit">Comment</button>
</form>
</article>
)