import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { useAuth } from "../auth/AuthContext";
import "../styles/NewEventForm.css";

export default function NewEventForm({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !date || !location.trim()) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setBusy(true);
    try {
      let imageUrl = "";

      // Upload image if present
      if (image) {
        const storageRef = ref(storage, `events/${Date.now()}_${image.name}`);
        const snapshot = await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Create event document
      const eventData = {
        title: title.trim(),
        description: description.trim(),
        date: date,
        time: time || "",
        location: location.trim(),
        imageUrl: imageUrl,
        link: link.trim(),
        authorId: user.uid,
        authorName: user.displayName || user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "events"), eventData);
      
      onSuccess?.();
    } catch (err) {
      console.error("Erreur lors de la création de l'événement:", err);
      alert("Erreur lors de la création de l'événement. Vérifiez que vous avez les permissions nécessaires.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="new-event-form" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <div>
            <h2>📅 Créer un événement</h2>
            <p className="form-subtitle">Partagez un nouvel événement avec la communauté</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">
              Titre de l'événement <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Soirée polyglotte, Atelier de conversation..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez l'événement en détail..."
              rows={5}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">
                Date <span className="required">*</span>
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Heure</label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">
              Lieu <span className="required">*</span>
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Campus, Salle B204, En ligne..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="link">Lien d'inscription / Plus d'infos</label>
            <input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image de l'événement</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Aperçu" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={busy}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={busy}
            >
              {busy ? "Création..." : "✨ Créer l'événement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
