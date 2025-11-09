import { useState } from 'react'


if (!user) {
return <div className="card">Login to post.</div>
}


async function handleSubmit(e) {
e.preventDefault()
setBusy(true)
try {
let mediaUrl = ''
if (file) {
const fileRef = ref(storage, `posts/${user.uid}/${Date.now()}_${file.name}`)
await uploadBytes(fileRef, file)
mediaUrl = await getDownloadURL(fileRef)
}
await addDoc(collection(db, 'posts'), {
title: title.trim(),
content: content.trim(),
category,
mediaUrl,
mediaType: file ? mediaType : null,
authorId: user.uid,
authorName: user.displayName || user.email,
createdAt: serverTimestamp()
})
setTitle(''); setContent(''); setFile(null)
alert('Post created')
} catch (e) {
console.error(e)
alert('Error creating post')
} finally {
setBusy(false)
}
}


return (
<form className="card form" onSubmit={handleSubmit}>
<h3>Create a post</h3>
<label>Title
<input className="ui-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your title" required />
</label>
{!fixedCategory && (
<label>Category
<select className="ui-select" value={category} onChange={(e) => setCategory(e.target.value)}>
{CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
</select>
</label>
)}
{fixedCategory && (
<div className="badge">{fixedCategory}</div>
)}
<label>Content
<textarea className="ui-input" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Say something" rows={4} required />
</label>
<label>Media (optional)
<select className="ui-select" value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
<option value="image">Image</option>
<option value="video">Video</option>
</select>
<input type="file" accept={mediaType === 'image' ? 'image/*' : 'video/*'} onChange={(e) => setFile(e.target.files?.[0] || null)} />
</label>
<button className="btn" disabled={busy} type="submit">{busy ? 'Posting…' : 'Post'}</button>
</form>
)
