// src/components/ProfileModal.jsx
import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "../firebase";

const YEARS = ["L1", "L2", "L3", "M1", "M2"];

export default function ProfileModal({ user, initialProfile, open, onClose, onSaved }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [year, setYear]           = useState(YEARS[2]); // L3 par défaut
  const [busy, setBusy]           = useState(false);

  useEffect(() => {
    if (!open) return;
    setFirstName(initialProfile?.firstName || "");
    setLastName(initialProfile?.lastName || "");
    setYear(initialProfile?.licenseYear || YEARS[2]);
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
      onSaved?.(); // <- ferme dans le Header
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
      <div className="modal-panel" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3>Mon profil</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div className="card" style={{ marginTop: 6 }}>
          <label>Prénom
            <input className="ui-input" value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Prénom" />
          </label>
          <label>Nom
            <input className="ui-input" value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Nom" />
          </label>
          <label>Année de licence
            <select className="ui-select" value={year} onChange={e=>setYear(e.target.value)}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:10 }}>
            <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button className="btn" onClick={save} disabled={busy}>
              {busy ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
