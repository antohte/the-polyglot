// src/components/ProfileModal.jsx
import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "../firebase";
import "../styles/ProfileModal.css";

const YEARS = ["L1", "L2", "L3", "M1", "M2"];

export default function ProfileModal({ user, initialProfile, open, onClose, onSaved }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [year, setYear]           = useState(YEARS[2]); // L3 par défaut
  const [busy, setBusy]           = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    setFirstName(initialProfile?.firstName || "");
    setLastName(initialProfile?.lastName || "");
    setYear(initialProfile?.licenseYear || YEARS[2]);
    setSuccessMsg("");
  }, [open, initialProfile]);

  if (!open) return null;

  async function save() {
    if (!user) return;
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!firstName.trim() || !lastName.trim()) {
      alert("Merci de renseigner prénom et nom.");
      return;
    }
    setBusy(true);
    try {
      const ref = doc(db, "users", user.uid);
      const payload = {
        uid: user.uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
        fullNameLower: fullName.toLowerCase(),
        licenseYear: year,
        updatedAt: new Date(),
      };
      await setDoc(ref, payload, { merge: true });
      await updateProfile(user, { displayName: fullName }).catch(() => {});
      setSuccessMsg("Profil mis à jour !");
      setTimeout(() => {
        onSaved?.();
      }, 500);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l’enregistrement du profil.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-panel modal-profile" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3>Compléter votre profil</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        {successMsg && <div className="success-banner">{successMsg}</div>}

        <div className="modal-content">
          <p className="modal-description">
            Aidez-nous à mieux vous connaître en complétant votre profil.
          </p>

          <div className="form-group">
            <label htmlFor="modal-firstname">Prénom</label>
            <input
              id="modal-firstname"
              className="ui-input"
              value={firstName}
              onChange={e=>setFirstName(e.target.value)}
              placeholder="Votre prénom"
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-lastname">Nom</label>
            <input
              id="modal-lastname"
              className="ui-input"
              value={lastName}
              onChange={e=>setLastName(e.target.value)}
              placeholder="Votre nom"
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-year">Année de licence</label>
            <select
              id="modal-year"
              className="ui-select"
              value={year}
              onChange={e=>setYear(e.target.value)}
            >
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
              Annuler
            </button>
            <button className="btn btn-primary" onClick={save} disabled={busy}>
              {busy ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
