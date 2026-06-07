import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Catalog = ({ navigateTo }) => {
  const { API_URL } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all"); // 'all', 'vino', 'cerveza'

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Build query string
        let query = "";
        if (selectedType !== "all") {
          query += `?type=${selectedType}`;
        }
        if (searchTerm) {
          query += (query ? "&" : "?") + `search=${encodeURIComponent(searchTerm)}`;
        }

        const res = await fetch(`${API_URL}/api/productes${query}`);
        if (!res.ok) {
          throw new Error("No s'ha pogut carregar el catàleg");
        }
        const data = await res.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Error de connexió amb el servidor. Revisa si el backend està actiu.");
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedType, API_URL]);

  const getProductImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/400x300/f0e6df/5c3a21?text=Producte";
    if (imagePath.startsWith("http")) return imagePath;
    
    // Fallback per a rutes relatives sembrades que donen 404 a producció
    if (imagePath.includes("tempranillo")) {
      return "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=400";
    }
    if (imagePath.includes("chardonnay")) {
      return "https://images.unsplash.com/photo-1569919650476-f54aea20054f?q=80&w=400";
    }
    if (imagePath.includes("ipa")) {
      return "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?q=80&w=400";
    }
    if (imagePath.includes("belgian")) {
      return "https://images.unsplash.com/photo-1567696911980-2dea991b1f58?q=80&w=400";
    }

    return `${API_URL}${imagePath}`;
  };

  return (
    <div className="catalog-page">
      {/* Hero Banner Section */}
      <div className="hero-banner">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-subtitle">BODEGA SELECTT</span>
          <h1>Descobreix els Millors Vins i Cerveses</h1>
          <p className="hero-desc">Una selecció premium acuradament seleccionada per a satisfer els paladars més exigents.</p>
          <a href="#cataleg-grid" className="btn btn-secondary hero-btn">Explorar la Botiga</a>
        </div>
      </div>

      <main className="content" id="cataleg-grid">
        {/* Search and Category Filter controls */}
        <div className="controls-bar">
          <div className="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Cerca vins, cerveses, marques..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control search-input"
            />
          </div>

          <div className="category-tabs">
            <button 
              onClick={() => setSelectedType("all")} 
              className={`tab-btn ${selectedType === "all" ? "active" : ""}`}
            >
              Tots els productes
            </button>
            <button 
              onClick={() => setSelectedType("vino")} 
              className={`tab-btn ${selectedType === "vino" ? "active" : ""}`}
            >
              Vins 🍷
            </button>
            <button 
              onClick={() => setSelectedType("cerveza")} 
              className={`tab-btn ${selectedType === "cerveza" ? "active" : ""}`}
            >
              Cerveses 🍺
            </button>
          </div>
        </div>

        {/* Catalog grid states */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregant el catàleg selecte...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">
            <span>{error}</span>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No s'han trobat productes</h3>
            <p>Prova de canviar els filtres o el text de cerca.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="card product-card">
                <div className="product-image-wrapper">
                  <img 
                    src={getProductImageUrl(product.image)} 
                    alt={product.name} 
                    className="product-image"
                    onClick={() => navigateTo(`product-${product._id}`)}
                  />
                  <span className={`product-badge badge-${product.type}`}>
                    {product.type === "vino" ? "Vi" : "Cervesa"}
                  </span>
                </div>

                <div className="product-info">
                  <span className="product-origin">{product.origin} &bull; {product.subType}</span>
                  <h3 className="product-name" onClick={() => navigateTo(`product-${product._id}`)}>
                    {product.name}
                  </h3>
                  <p className="product-desc">{product.description}</p>
                  
                  <div className="product-specs">
                    <span className="spec-item">
                      <strong>Graduació:</strong> {product.graduacio}%
                    </span>
                    <span className="spec-item">
                      <strong>Estoc:</strong> {product.stock > 0 ? `${product.stock} un.` : <span className="no-stock">Sense estoc</span>}
                    </span>
                  </div>

                  <div className="product-footer">
                    <span className="product-price">{product.price.toFixed(2)}€</span>
                    <div className="product-actions">
                      <button 
                        onClick={() => navigateTo(`product-${product._id}`)}
                        className="btn btn-outline btn-sm-card"
                      >
                        Detall
                      </button>
                      <button 
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                        className="btn btn-primary btn-sm-card"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .hero-banner {
          position: relative;
          background-color: #3e2717;
          background-image: url('https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1200');
          background-size: cover;
          background-position: center;
          height: 380px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--text-white);
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, rgba(92, 58, 33, 0.4) 0%, rgba(43, 26, 14, 0.85) 100%);
        }

        .hero-content {
          position: relative;
          z-index: 10;
          max-width: 700px;
          padding: 20px;
        }

        .hero-subtitle {
          font-size: 0.9rem;
          letter-spacing: 4px;
          color: var(--accent);
          font-weight: 700;
          display: block;
          margin-bottom: 15px;
        }

        .hero-banner h1 {
          font-family: var(--font-serif);
          font-size: 2.8rem;
          color: var(--text-white);
          line-height: 1.2;
          margin-bottom: 15px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .hero-desc {
          font-size: 1.15rem;
          margin-bottom: 25px;
          color: #e6dfcf;
          line-height: 1.5;
        }

        .hero-btn {
          padding: 12px 30px;
          font-size: 1rem;
        }

        /* Controls */
        .controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
          gap: 20px;
          flex-wrap: wrap;
          background-color: var(--card-bg);
          padding: 20px;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 280px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
        }

        .search-input {
          padding-left: 42px;
          border-radius: 30px;
        }

        .category-tabs {
          display: flex;
          gap: 10px;
        }

        .tab-btn {
          padding: 8px 18px;
          background-color: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: 30px;
          color: var(--text-light);
          font-family: var(--font-sans);
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: var(--transition);
        }

        .tab-btn:hover {
          border-color: var(--secondary);
          color: var(--primary);
        }

        .tab-btn.active {
          background-color: var(--primary);
          border-color: var(--primary);
          color: var(--text-white);
        }

        /* Products Grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 30px;
        }

        .product-card {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .product-image-wrapper {
          position: relative;
          height: 220px;
          background-color: #f7f3eb;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 15px;
          cursor: pointer;
          transition: transform 0.5s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.05);
        }

        .product-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .badge-vino {
          background-color: #8d1c24;
          color: white;
        }

        .badge-cerveza {
          background-color: #e5a93b;
          color: #2b1a0e;
        }

        .product-info {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .product-origin {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }

        .product-name {
          font-size: 1.2rem;
          margin-bottom: 8px;
          cursor: pointer;
          transition: var(--transition);
        }

        .product-name:hover {
          color: var(--secondary);
        }

        .product-desc {
          font-size: 0.85rem;
          color: var(--text-light);
          margin-bottom: 15px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
        }

        .product-specs {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          padding: 8px 0;
          margin-bottom: 15px;
          font-size: 0.8rem;
          color: var(--text-dark);
        }

        .no-stock {
          color: var(--danger);
          font-weight: 700;
        }

        .product-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }

        .product-price {
          font-size: 1.3rem;
          font-family: var(--font-serif);
          font-weight: 700;
          color: var(--primary);
        }

        .product-actions {
          display: flex;
          gap: 6px;
        }

        .btn-sm-card {
          padding: 6px 10px;
          font-size: 0.8rem;
        }

        /* General States */
        .loading-state, .empty-state {
          text-align: center;
          padding: 80px 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top-color: var(--secondary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px auto;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Catalog;
