import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = ({ navigateTo }) => {
  const { user, token, API_URL } = useAuth();
  
  // States
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    // Role protection - admin only
    if (!token) {
      navigateTo("login");
      return;
    }
    if (user && user.role !== "admin") {
      navigateTo("catalog");
      return;
    }

    fetchUsers();
  }, [token, user, navigateTo]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/usuaris`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error("No s'ha pogut obtenir el llistat d'usuaris");
      }
      const data = await res.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error carregant el llistat d'usuaris");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, userEmail, newRole) => {
    if (userEmail === user.email) {
      alert("No pots canviar el teu propi rol d'administrador!");
      return;
    }

    if (!window.confirm(`Segur que vols canviar el rol de l'usuari "${userEmail}" a "${newRole.toUpperCase()}"?`)) {
      // Reload current state to reset select element
      fetchUsers();
      return;
    }

    try {
      setActionLoadingId(userId);
      const res = await fetch(`${API_URL}/api/usuaris/${userId}/rol`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No s'ha pogut actualitzar el rol");
      }

      alert("Rol actualitzat correctament!");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.message);
      fetchUsers(); // reset UI
    } finally {
      setActionLoadingId(null);
    }
  };

  const getAvatarUrl = (photoPath) => {
    if (!photoPath) return "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
    if (photoPath.startsWith("http")) return photoPath;
    return `${API_URL}${photoPath}`;
  };

  return (
    <main className="content">
      <div className="dashboard-header-row mb-20">
        <h1>Dashboard Administrador 👑</h1>
        
        <div className="admin-actions-bar">
          <button onClick={() => navigateTo("editor")} className="btn btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "6px"}}>
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
            </svg>
            Anar a Gestió de Productes
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-20">
          <span>{error}</span>
        </div>
      )}

      {/* Users management table */}
      <div className="card dashboard-table-card">
        <div className="card-header-padding" style={{ padding: "20px", borderBottom: "1px solid var(--border-color)", backgroundColor: "#f7f3eb" }}>
          <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Gestió de Rols d'Usuaris</h2>
        </div>

        {loading ? (
          <div className="text-center p-40">
            <div className="spinner"></div>
            <p>Carregant usuaris...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Nom complet</th>
                  <th>Correu Electrònic</th>
                  <th>Rol Actual</th>
                  <th>Assignar Nou Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id || u.id}>
                    <td>
                      <img 
                        src={getAvatarUrl(u.photo)} 
                        alt={u.name} 
                        style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--accent)" }} 
                      />
                    </td>
                    <td><strong>{u.name}</strong> {u.email === user.email && <span style={{ fontSize: "0.8rem", color: "var(--secondary)", fontStyle: "italic" }}>(Tu)</span>}</td>
                    <td><code>{u.email}</code></td>
                    <td>
                      <span className={`role-badge badge-${u.role}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id || u.id, u.email, e.target.value)}
                        disabled={u.email === user.email || actionLoadingId === (u._id || u.id)}
                        className="form-control select-role-control"
                      >
                        <option value="usuari">Usuari (usuari)</option>
                        <option value="editor">Editor (editor)</option>
                        <option value="admin">Administrador (admin)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .admin-actions-bar {
          display: flex;
          gap: 10px;
        }

        .select-role-control {
          max-width: 180px;
          padding: 6px 12px;
          font-size: 0.85rem;
        }

        .role-badge {
          display: inline-block;
          padding: 3px 8px;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 10px;
          text-align: center;
        }

        .badge-admin {
          background-color: #fce7f3;
          color: #db2777;
        }

        .badge-editor {
          background-color: #e0f2fe;
          color: #0369a1;
        }

        .badge-usuari {
          background-color: #f1f5f9;
          color: #475569;
        }
      `}</style>
    </main>
  );
};

export default AdminDashboard;
