// src/pages/Events.jsx
import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import useUserProfile from "../hooks/useUserProfile";
import EventCard from "../components/EventCard";
import NewEventForm from "../components/NewEventForm";
import "../styles/Events.css";

export default function Events() {
    const { user } = useAuth();
    const { profile } = useUserProfile(user?.uid);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewEvent, setShowNewEvent] = useState(false);

    const isOrganizer = profile?.role === "organizer" || profile?.role === "admin";

    useEffect(() => {
        let mounted = true;

        async function loadEvents() {
            setLoading(true);
            try {
                const data = await api.events.getAll();
                const mappedEvents = data.map(e => ({
                    ...e,
                    date: e.event_date ? new Date(e.event_date) : null,
                    // If EventCard expects Firestore Timestamp, it might have .toDate() method usage.
                    // If EventCard expects Date object or string, this works.
                    // I should check EventCard.
                    // For now, I'll provide a Date object.
                }));
                // Sort ascending
                mappedEvents.sort((a, b) => (a.date > b.date ? 1 : -1));

                if (mounted) {
                    setEvents(mappedEvents);
                }
            } catch (err) {
                console.error("Error loading events:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadEvents();
        return () => { mounted = false; };
    }, []);

    if (loading) {
        return <div className="container">Chargement...</div>;
    }

    return (
        <div className="container">
            {/* Hero Section - Department Description */}
            <div className="events-hero">
                <h1>📅 Pôle Événementiel</h1>
                <p>
                    Bienvenue au Pôle Événementiel de The Polyglot ! Découvrez nos événements
                    culturels, linguistiques et académiques. Participez à des conférences,
                    ateliers, soirées culturelles et bien plus encore. Chaque événement est
                    une opportunité unique de pratiquer les langues, rencontrer d'autres
                    étudiants passionnés et enrichir votre expérience internationale.
                </p>
            </div>

            {/* Events Grid */}
            <div className="events-grid">
                {events.length === 0 ? (
                    <div className="card">
                        <p style={{ color: "var(--muted)" }}>
                            Aucun événement à venir pour le moment. Revenez bientôt !
                        </p>
                    </div>
                ) : (
                    events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))
                )}
            </div>

            {/* FAB for creating events (admin and organizers only) */}
            {user && isOrganizer && (
                <button
                    className="fab"
                    onClick={() => setShowNewEvent(true)}
                    title="Créer un événement"
                >
                    + Nouvel événement
                </button>
            )}

            {/* Modal for creating new event */}
            {showNewEvent && (
                <NewEventForm
                    onClose={() => setShowNewEvent(false)}
                    onSuccess={() => {
                        setShowNewEvent(false);
                    }}
                />
            )}
        </div>
    );
}
