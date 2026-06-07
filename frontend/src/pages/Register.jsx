import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Register = ({ navigateTo }) => {
  const { API_URL } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("usuari");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation: images only
    if (!file.type.startsWith("image/")) {
      setError("El fitxer ha de ser una imatge");
      return;
    }

    // Validation: 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError("La imatge és massa gran. El límit és 5MB");
      return;
    }

    setPhoto(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Els camps nom, email i contrasenya són obligatoris");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create multipart/form-data object
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      if (photo) {
        formData.append("photo", photo);
      }

      const res = await fetch(`${API_URL}/api/auth/registro`, {
        method: "POST",
        body: formData
        // Note: Do NOT set Content-Type header when sending FormData. Fetch sets it automatically with the boundary token.
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "S'ha produït un error en registrar l'usuari");
      }

      setSuccess(true);
      setTimeout(() => {
        navigateTo("login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="content flex align-center justify-between" style={{ minHeight: "75vh" }}>
      <div className="auth-card card">
        <h2 className="text-center mb-10">Crea el teu compte 🍷</h2>
        <p className="text-center text-light mb-20">Registra't per afegir productes selectes al carret i fer comandes.</p>

        {success && (
          <div className="alert alert-success">
            <span><strong>Registre completat!</strong> Redirigint al formulari de login...</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-name">Nom complet</label>
            <input 
              type="text" 
              id="reg-name" 
              placeholder="Joan Garcia" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Correu electrònic</label>
            <input 
              type="email" 
              id="reg-email" 
              placeholder="joan@exemple.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Contrasenya</label>
            <input 
              type="password" 
              id="reg-password" 
              placeholder="Mínim 6 caràcters" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
            />
          </div>

          {/* Role selector - convenient for testing academic criteria */}
          <div className="form-group">
            <label htmlFor="reg-role">Rol (Per a proves acadèmiques)</label>
            <select 
              id="reg-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-control"
            >
              <option value="usuari">Usuari (compra + correu)</option>
              <option value="editor">Editor (CRUD Catàleg)</option>
              <option value="admin">Administrador (CRUD + Rols)</option>
            </select>
          </div>

          {/* Profile picture input */}
          <div className="form-group">
            <label htmlFor="reg-photo">Foto de perfil</label>
            <input 
              type="file" 
              id="reg-photo" 
              accept="image/*"
              onChange={handleFileChange}
              className="form-control"
              style={{ padding: "8px" }}
            />
            
            {photoPreview && (
              <div className="photo-preview-wrapper mt-20">
                <p style={{ fontSize: "0.8rem", color: "var(--text-light)", marginBottom: "4px" }}>Previsualització:</p>
                <img src={photoPreview} alt="Preview avatar" className="photo-preview-img" />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading || success}
            className="btn btn-primary w-full mt-20"
          >
            {loading ? "Registrant usuari..." : "Registrar-se"}
          </button>
        </form>

        <p className="auth-footer text-center mt-20">
          Ja tens un compte?{" "}
          <a href="#/login" onClick={(e) => { e.preventDefault(); navigateTo("login"); }}>
            Inicia sessió aquí
          </a>
        </p>
      </div>

      <style>{`
        .auth-card {
          max-width: 500px;
          width: 100%;
          margin: 0 auto;
          padding: 30px 40px;
        }

        .photo-preview-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .photo-preview-img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--accent);
        }

        .auth-footer {
          font-size: 0.9rem;
          color: var(--text-light);
        }
      `}</style>
    </main>
  );
};

export default Register;
