import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const EditorDashboard = ({ navigateTo }) => {
  const { user, token, API_URL } = useAuth();
  
  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form/Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editProductId, setEditProductId] = useState(null); // null means "create mode"
  
  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("vino");
  const [graduacio, setGraduacio] = useState("");
  const [subType, setSubType] = useState("");
  const [origin, setOrigin] = useState("");
  const [stock, setStock] = useState("10");
  const [imageFile, setImageFile] = useState(null);
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    // Role protection - editor or admin only
    if (!token) {
      navigateTo("login");
      return;
    }
    if (user && user.role !== "editor" && user.role !== "admin") {
      navigateTo("catalog");
      return;
    }

    fetchProducts();
  }, [token, user, navigateTo]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/productes`);
      if (!res.ok) {
        throw new Error("No s'ha pogut obtenir els productes");
      }
      const data = await res.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error carregant el llistat de productes");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateForm = () => {
    setEditProductId(null);
    setName("");
    setDescription("");
    setPrice("");
    setType("vino");
    setGraduacio("");
    setSubType("");
    setOrigin("");
    setStock("10");
    setImageFile(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (product) => {
    setEditProductId(product._id);
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setType(product.type);
    setGraduacio(String(product.graduacio));
    setSubType(product.subType);
    setOrigin(product.origin);
    setStock(String(product.stock));
    setImageFile(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (id, prodName) => {
    if (!window.confirm(`Segur que vols eliminar el producte "${prodName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/productes/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "No s'ha pogut eliminar el producte");
      }

      alert("Producte eliminat correctament!");
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !description || !price || !graduacio || !subType || !origin || !stock) {
      setFormError("Tots els camps són obligatoris");
      return;
    }

    try {
      setFormLoading(true);
      setFormError(null);

      // Create FormData to support image file upload
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("type", type);
      formData.append("graduacio", graduacio);
      formData.append("subType", subType);
      formData.append("origin", origin);
      formData.append("stock", stock);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const method = editProductId ? "PUT" : "POST";
      const endpoint = editProductId 
        ? `${API_URL}/api/productes/${editProductId}`
        : `${API_URL}/api/productes`;

      const res = await fetch(endpoint, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error processant el producte");
      }

      alert(editProductId ? "Producte actualitzat amb èxit!" : "Producte creat amb èxit!");
      setIsFormOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <main className="content">
      <div className="dashboard-header-row mb-20">
        <h1>Dashboard Editor 🍷</h1>
        <button onClick={handleOpenCreateForm} className="btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "6px"}}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Crear Nou Producte
        </button>
      </div>

      {error && (
        <div className="alert alert-danger mb-20">
          <span>{error}</span>
        </div>
      )}

      {/* Products table */}
      <div className="card dashboard-table-card">
        {loading ? (
          <div className="text-center p-40">
            <div className="spinner"></div>
            <p>Carregant productes per a edició...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-40">
            <p>No hi ha productes en el catàleg.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Tipus</th>
                  <th>Subtipus/Estil</th>
                  <th>Origen</th>
                  <th>Preu</th>
                  <th>Estoc</th>
                  <th style={{ textAlign: "center" }}>Accions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td><strong>{p.name}</strong></td>
                    <td>
                      <span className={`table-badge badge-${p.type}`}>
                        {p.type === "vino" ? "Vi" : "Cervesa"}
                      </span>
                    </td>
                    <td>{p.subType}</td>
                    <td>{p.origin}</td>
                    <td style={{ fontWeight: "600" }}>{p.price.toFixed(2)}€</td>
                    <td>
                      <span className={p.stock > 0 ? "stock-ok" : "stock-ko"}>
                        {p.stock} un.
                      </span>
                    </td>
                    <td className="table-actions-cell">
                      <button onClick={() => handleOpenEditForm(p)} className="btn-edit-action" title="Editar">
                        Editar
                      </button>
                      <button onClick={() => handleDeleteProduct(p._id, p.name)} className="btn-delete-action" title="Eliminar">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h2>{editProductId ? "Editar Producte ✏️" : "Crear Nou Producte 🍷"}</h2>
              <button onClick={() => setIsFormOpen(false)} className="modal-close-btn">&times;</button>
            </div>

            {formError && (
              <div className="alert alert-danger mb-15">
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="prod-name">Nom del Producte</label>
                  <input 
                    type="text" 
                    id="prod-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="prod-type">Tipus</label>
                  <select 
                    id="prod-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="form-control"
                  >
                    <option value="vino">Vi (vino)</option>
                    <option value="cerveza">Cervesa (cerveza)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prod-desc">Descripció</label>
                <textarea 
                  id="prod-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="prod-price">Preu (€)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    id="prod-price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-stock">Estoc</label>
                  <input 
                    type="number" 
                    id="prod-stock"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="prod-subType">{type === "vino" ? "Subtipus (p. ex. Negre Criança)" : "Estil (p. ex. IPA, Lager)"}</label>
                  <input 
                    type="text" 
                    id="prod-subType"
                    value={subType}
                    onChange={(e) => setSubType(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-origin">{type === "vino" ? "Origen / D.O. (p. ex. Rioja)" : "Origen (p. ex. Bèlgica)"}</label>
                  <input 
                    type="text" 
                    id="prod-origin"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="prod-grad">Graduació d'Alcohol (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    id="prod-grad"
                    value={graduacio}
                    onChange={(e) => setGraduacio(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-image">Imatge del Producte</label>
                  <input 
                    type="file" 
                    id="prod-image"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="form-control"
                    style={{ padding: "8px" }}
                  />
                </div>
              </div>

              <div className="modal-footer mt-20">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)} 
                  className="btn btn-outline"
                  style={{ marginRight: "10px" }}
                >
                  Cancel·lar
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="btn btn-primary"
                >
                  {formLoading ? "Desant..." : "Desar Producte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .dashboard-table-card {
          padding: 0;
          overflow: hidden;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .dashboard-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .dashboard-table th, .dashboard-table td {
          padding: 14px 20px;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.95rem;
        }

        .dashboard-table th {
          background-color: #f7f3eb;
          color: var(--primary);
          font-weight: 700;
        }

        .dashboard-table tr:hover {
          background-color: rgba(92, 58, 33, 0.02);
        }

        .table-badge {
          padding: 3px 8px;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 10px;
          text-transform: uppercase;
        }

        .table-actions-cell {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .btn-edit-action, .btn-delete-action {
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: var(--transition);
        }

        .btn-edit-action {
          background-color: var(--accent-light);
          color: var(--primary);
        }

        .btn-edit-action:hover {
          background-color: var(--accent);
          color: var(--primary);
        }

        .btn-delete-action {
          background-color: rgba(178, 59, 59, 0.1);
          color: var(--danger);
        }

        .btn-delete-action:hover {
          background-color: var(--danger);
          color: var(--text-white);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(43, 26, 14, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 20px;
        }

        .modal-content {
          max-width: 650px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 10px;
        }

        .modal-close-btn {
          background: transparent;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: var(--text-light);
        }

        .modal-close-btn:hover {
          color: var(--primary);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid var(--border-color);
          padding-top: 15px;
        }
      `}</style>
    </main>
  );
};

export default EditorDashboard;
