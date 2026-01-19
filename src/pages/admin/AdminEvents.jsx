import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import "../../styles/Admin.css";

export default function AdminEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form state
    const [newEvent, setNewEvent] = useState({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        imageUrl: "",
        category: "culture"
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const snap = await getDocs(collection(db, "events"));
            const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            // Tri par date
            data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setEvents(data);
        } catch (err) {
            console.error("Error fetching events:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm("Supprimer cet événement ?")) return;
        try {
            await deleteDoc(doc(db, "events", eventId));
            setEvents((prev) => prev.filter((e) => e.id !== eventId));
        } catch (err) {
            console.error("Error deleting event:", err);
            alert("Erreur suppression");
        }
    };

    const handleChange = (e) => {
        setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Construction de l'objet événement
            const docData = {
                ...newEvent,
                createdAt: Timestamp.now()
                // La date est stockée en string YYYY-MM-DD ou on pourrait la convertir en Timestamp
                // Pour l'instant on garde la string saisie dans le type="date"
            };

            const ref = await addDoc(collection(db, "events"), docData);
            setEvents([...events, { id: ref.id, ...docData }]);
            setShowForm(false);
            setNewEvent({ title: "", date: "", time: "", location: "", description: "", imageUrl: "", category: "culture" });
        } catch (err) {
            console.error("Error creating event:", err);
            alert("Erreur création");
        }
    };

    if (loading) return <div className="admin-loading">Chargement des événements...</div>;

    // Filtrage des événements
    const filteredEvents = events.filter(event => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase();
        return (
            event.title?.toLowerCase().includes(search) ||
            event.description?.toLowerCase().includes(search) ||
            event.location?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="admin-page">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1>Gestion des Événements</h1>
                <button className="admin-btn btn-success" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Annuler" : "+ Nouvel Événement"}
                </button>
            </div>

            <div className="search-container" style={{
                marginBottom: "2rem",
                padding: "1.5rem",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
                borderRadius: "16px",
                border: "1px solid rgba(139, 92, 246, 0.2)",
                backdropFilter: "blur(10px)"
            }}>
                <div style={{ position: "relative" }}>
                    <span style={{
                        position: "absolute",
                        left: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "1.25rem",
                        color: "#a78bfa"
                    }}>🔍</span>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Rechercher par titre, description ou lieu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            paddingLeft: "3rem",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(139, 92, 246, 0.3)",
                            borderRadius: "12px",
                            fontSize: "1rem",
                            transition: "all 0.3s ease"
                        }}
                    />
                </div>
                {searchTerm && (
                    <div style={{
                        marginTop: "0.75rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <p style={{ color: "#c4b5fd", fontSize: "0.875rem", margin: 0 }}>
                            ✨ {filteredEvents.length} résultat(s) sur {events.length} événement(s)
                        </p>
                        <button
                            onClick={() => setSearchTerm("")}
                            style={{
                                background: "rgba(139, 92, 246, 0.2)",
                                border: "none",
                                color: "#c4b5fd",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "6px",
                                fontSize: "0.875rem",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                        >
                            ✕ Effacer
                        </button>
                    </div>
                )}
            </div>

            {showForm && (
                <form className="admin-form" onSubmit={handleSubmit} style={{ marginBottom: "2rem", background: "rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <input className="input-field" name="title" placeholder="Titre" value={newEvent.title} onChange={handleChange} required />
                        <select className="input-field" name="category" value={newEvent.category} onChange={handleChange}>
                            <option value="culture">Culture</option>
                            <option value="academique">Académique</option>
                            <option value="soiree">Soirée</option>
                            <option value="autre">Autre</option>
                        </select>
                        <input className="input-field" type="date" name="date" value={newEvent.date} onChange={handleChange} required />
                        <input className="input-field" type="time" name="time" value={newEvent.time} onChange={handleChange} required />
                        <input className="input-field" name="location" placeholder="Lieu" value={newEvent.location} onChange={handleChange} required />
                        <input className="input-field" name="imageUrl" placeholder="URL Image (Optionnel)" value={newEvent.imageUrl} onChange={handleChange} />
                    </div>
                    <textarea className="input-field" name="description" placeholder="Description" value={newEvent.description} onChange={handleChange} required style={{ width: "100%", marginTop: "1rem", minHeight: "100px" }} />
                    <button type="submit" className="admin-btn btn-primary" style={{ marginTop: "1rem" }}>Créer l'événement</button>
                </form>
            )}

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Titre</th>
                            <th>Lieu</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEvents.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                                    {searchTerm ? "Aucun événement ne correspond à votre recherche" : "Aucun événement disponible"}
                                </td>
                            </tr>
                        ) : (
                            filteredEvents.map((evt) => (
                            <tr key={evt.id}>
                                <td>{evt.date} à {evt.time}</td>
                                <td>{evt.title}</td>
                                <td>{evt.location}</td>
                                <td>
                                    <button className="admin-btn btn-danger" onClick={() => handleDelete(evt.id)}>
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
