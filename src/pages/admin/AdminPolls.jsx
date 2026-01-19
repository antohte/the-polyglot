import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import "../../styles/Admin.css";

export default function AdminPolls() {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form state
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]); // Default 2 options

    useEffect(() => {
        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        try {
            const snap = await getDocs(collection(db, "polls"));
            const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setPolls(data);
        } catch (err) {
            console.error("Error fetching polls:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (pollId) => {
        if (!window.confirm("Supprimer ce sondage ?")) return;
        try {
            await deleteDoc(doc(db, "polls", pollId));
            setPolls((prev) => prev.filter((p) => p.id !== pollId));
        } catch (err) {
            console.error("Error deleting poll:", err);
            alert("Erreur suppression");
        }
    };

    const handleOptionChange = (idx, val) => {
        const newOptions = [...options];
        newOptions[idx] = val;
        setOptions(newOptions);
    };

    const addOption = () => setOptions([...options, ""]);
    const removeOption = (idx) => {
        if (options.length <= 2) return;
        setOptions(options.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Filter empty options
        const validOptions = options.filter(o => o.trim() !== "").map(text => ({ text, votes: 0 }));
        if (validOptions.length < 2) {
            alert("Il faut au moins 2 options valides.");
            return;
        }

        try {
            const docData = {
                question,
                options: validOptions,
                createdAt: Timestamp.now()
            };

            const ref = await addDoc(collection(db, "polls"), docData);
            setPolls([...polls, { id: ref.id, ...docData }]);
            setShowForm(false);
            setQuestion("");
            setOptions(["", ""]);
        } catch (err) {
            console.error("Error creating poll:", err);
            alert("Erreur création sondage");
        }
    };

    if (loading) return <div className="admin-loading">Chargement des sondages...</div>;

    // Filtrage des sondages
    const filteredPolls = polls.filter(poll => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase();
        return poll.question?.toLowerCase().includes(search);
    });

    return (
        <div className="admin-page">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1>Gestion des Sondages</h1>
                <button className="admin-btn btn-success" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Annuler" : "+ Nouveau Sondage"}
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
                        placeholder="Rechercher par question..."
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
                            ✨ {filteredPolls.length} résultat(s) sur {polls.length} sondage(s)
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
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>Question</label>
                        <input className="input-field" style={{ width: "100%" }} value={question} onChange={e => setQuestion(e.target.value)} required placeholder="Ex: Quel événement pour vendredi ?" />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label>Options</label>
                        {options.map((opt, idx) => (
                            <div key={idx} style={{ display: "flex", gap: "0.5rem" }}>
                                <input
                                    className="input-field"
                                    style={{ flex: 1 }}
                                    value={opt}
                                    onChange={e => handleOptionChange(idx, e.target.value)}
                                    placeholder={`Option ${idx + 1}`}
                                    required
                                />
                                {options.length > 2 && (
                                    <button type="button" className="admin-btn btn-danger" onClick={() => removeOption(idx)}>X</button>
                                )}
                            </div>
                        ))}
                        <button type="button" className="admin-btn" onClick={addOption} style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.1)" }}>+ Ajouter option</button>
                    </div>

                    <button type="submit" className="admin-btn btn-primary" style={{ marginTop: "1.5rem" }}>Créer le sondage</button>
                </form>
            )}

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Question</th>
                            <th>Options</th>
                            <th>Total Votes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPolls.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                                    {searchTerm ? "Aucun sondage ne correspond à votre recherche" : "Aucun sondage disponible"}
                                </td>
                            </tr>
                        ) : (
                            filteredPolls.map((poll) => {
                            const totalVotes = poll.options?.reduce((acc, curr) => acc + (curr.votes || 0), 0) || 0;
                            return (
                                <tr key={poll.id}>
                                    <td>{poll.question}</td>
                                    <td>{poll.options?.length || 0} options</td>
                                    <td>{totalVotes}</td>
                                    <td>
                                        <button className="admin-btn btn-danger" onClick={() => handleDelete(poll.id)}>
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
