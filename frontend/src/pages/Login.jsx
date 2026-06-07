import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Login = ({ navigateTo }) => {
  const { login, API_URL } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Si us plau, omple tots els camps");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "S'ha produït un error en iniciar sessió");
      }

      // Context login
      login(data.token, data.user);
      
      // Redirect to catalog or profile
      navigateTo("catalog");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="content flex align-center justify-between" style={{ minHeight: "70vh" }}>
      <div className="auth-card card">
        <h2 className="text-center mb-10">Benvingut de nou 🍷</h2>
        <p className="text-center text-light mb-20">Inicia sessió per a poder fer comandes i gestionar el teu perfil.</p>
        
        {error && (
          <div className="alert alert-danger">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Correu electrònic</label>
            <input 
              type="email" 
              id="login-email" 
              placeholder="usuari@exemple.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Contrasenya</label>
            <input 
              type="password" 
              id="login-password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-full mt-20"
          >
            {loading ? "Iniciant sessió..." : "Iniciar Sessió"}
          </button>
        </form>

        <p className="auth-footer text-center mt-20">
          No tens un compte?{" "}
          <a href="#/register" onClick={(e) => { e.preventDefault(); navigateTo("register"); }}>
            Registra't aquí
          </a>
        </p>
      </div>

      <style>{`
        .auth-card {
          max-width: 450px;
          width: 100%;
          margin: 0 auto;
          padding: 40px;
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 20px;
          }
        }

        .auth-footer {
          font-size: 0.9rem;
          color: var(--text-light);
        }
      `}</style>
    </main>
  );
};

export default Login;
