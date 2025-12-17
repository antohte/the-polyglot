// src/components/EventCard.jsx
import { useState } from "react";
import "../styles/Events.css";

export default function EventCard({ event }) {
    const [isRSVPd, setIsRSVPd] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const handleRSVP = (e) => {
        e.stopPropagation();
        setIsRSVPd(!isRSVPd);
        // TODO: Update Firebase
    };

    return (
        <div className="event-card">
            <div className="event-date-badge">
                {formatDate(event.date)}
            </div>

            {event.photoUrl && (
                <img
                    src={event.photoUrl}
                    alt={event.title}
                    className="event-photo"
                />
            )}

            <h3 className="event-title">{event.title}</h3>

            <p className="event-description">{event.description}</p>

            <div className="event-meta">
                <div className="event-meta-item">
                    <span>🕐</span>
                    <span>{formatTime(event.date)}</span>
                </div>
                <div className="event-meta-item">
                    <span>📍</span>
                    <span>{event.location}</span>
                </div>
                {event.attendees && (
                    <div className="event-meta-item">
                        <span>👥</span>
                        <span>{event.attendees.length} participant(s)</span>
                    </div>
                )}
            </div>

            <div className="event-actions">
                <button
                    className={isRSVPd ? "btn" : "btn-ghost"}
                    onClick={handleRSVP}
                >
                    {isRSVPd ? "✅ Inscrit" : "📝 S'inscrire"}
                </button>
                {isRSVPd && (
                    <span className="rsvp-count">
                        Vous êtes inscrit
                    </span>
                )}
            </div>
        </div>
    );
}
