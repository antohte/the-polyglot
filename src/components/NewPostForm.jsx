// src/components/NewPostForm.jsx
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { useAuth } from "../auth/AuthContext";
import { CATEGORIES } from "../constants/categories";
import useUserProfile from "../hooks/useUserProfile";

export default function NewPostForm({ fixedCategory = null, onSuccess }) {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(
    fixedCategory || (CATEGORIES[0]?.name || CATEGORIES[0])
  );
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [busy, setBusy] = useState(false);

  if (!user) {
    return <div className="card">Login to post.</div>;
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
      const authorName = profile?.fullName || user.displayName || user.email || "Utilisateur";
      await addDoc(collection(db, "posts"), {
        title: title.trim(),
        content: content.trim(),
        category,
        mediaUrl,
        mediaType: file ? mediaType : null,
        authorId: user.uid,
        authorName,
        authorNameLower: authorName.toLowerCase(), // utile plus tard
        createdAt: serverTimestamp(),
      });

      setTitle(""); setContent(""); setFile(null);
      onSuccess?.();
    } catch (e) {
      console.error(e);
      alert("Error creating post");
    } finally {
      setBusy(false);
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
            {CATEGORIES.map((c) => {
              const name = c.name ?? c;
              return <option key={name} value={name}>{name}</option>;
            })}
          </select>
        </label>
      )}
      {fixedCategory && <div className="badge" style={{ marginBottom: 8 }}>{fixedCategory}</div>}

      <label>Content
        <textarea className="ui-input" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Say something" rows={4} required />
      </label>

      <label>Media (optional)
        <select className="ui-select" value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
        <input type="file" accept={mediaType === "image" ? "image/*" : "video/*"} onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </label>

      <button className="btn" disabled={busy} type="submit">{busy ? "Posting…" : "Post"}</button>
    </form>
  );
}

