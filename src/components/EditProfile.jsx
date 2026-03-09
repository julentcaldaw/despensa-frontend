import React, { useState } from "react";
import { authFetch } from "../utils/auth";
import { X } from "lucide-react";

export default function EditProfileModal({ user, show, onClose, onSaved }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  if (!show) return null;

  const validateEmail = (email) => {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");
    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!email.trim()) {
      setError("El email es obligatorio.");
      return;
    }
    if (!validateEmail(email)) {
      setError("El email no es válido.");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword && !oldPassword) {
      setError("Debes ingresar la contraseña actual para cambiar la nueva.");
      return;
    }
    setLoading(true);
    try {
      const body = { name, email };
      if (newPassword) {
        body.oldPassword = oldPassword;
        body.newPassword = newPassword;
      }
      const res = await authFetch("/api/usuario", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("No se pudo actualizar el perfil");
      setSuccess("Perfil actualizado correctamente.");
      if (onSaved) onSaved();
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pantry-modal-bg" onClick={onClose}>
      <div className="pantry-modal" onClick={e => e.stopPropagation()} >
        <button className="pantry-modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <h3 className="pantry-modal-title">Editar Perfil</h3>
        <form className="pantry-modal-form" onSubmit={handleSubmit} autoComplete="off">
          <input
            className="pantry-input"
            type="text"
            name="name"
            placeholder="Nombre"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoFocus
          />
          <input
            className="pantry-input"
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="pantry-input"
            type="password"
            name="oldPassword"
            placeholder="Contraseña actual"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
          />
          <input
            className="pantry-input"
            type="password"
            name="newPassword"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          {error && <div className="pantry-error pantry-error-primary">{error}</div>}
          {success && <div className="pantry-success pantry-success-primary">{success}</div>}
          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="login-register-link bg-transparent border-none shadow-none p-0 cursor-pointer"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
