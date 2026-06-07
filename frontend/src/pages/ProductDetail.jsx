import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const ProductDetail = ({ productId, navigateTo }) => {
  const { API_URL } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/productes/${productId}`);
        
        if (res.status === 404) {
          setError("Producte no trobat (404)");
          return;
        }

        if (!res.ok) {
          throw new Error("Error obtenint dades del producte");
        }

        const data = await res.json();
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Error de connexió amb el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, API_URL]);

  const handleQtyChange = (val) => {
    if (val < 1) return;
    if (product && val > product.stock) {
      alert(`Només hi ha ${product.stock} unitats en estoc.`);
      return;
    }
    setQuantity(val);
  };

  const getProductImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/600x500/f0e6df/5c3a21?text=Producte";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  if (loading) {
    return (
      <main className="content text-center">
        <div className="spinner"></div>
        <p>Carregant detalls del producte...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="content">
        <button onClick={() => navigateTo("catalog")} className="btn btn-outline mb-20">&larr; Tornar al catàleg</button>
        <div className="error-detail-card card">
          <h2>⚠️ {error}</h2>
          <p>El producte sol·licitat no existeix o s'ha produït un error de xarxa.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="content">
      <button onClick={() => navigateTo("catalog")} className="btn btn-outline mb-20">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "6px"}}>
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Tornar al catàleg
      </button>

      {product && (
        <div className="product-detail-layout card">
          <div className="detail-image-section">
            <img src={getProductImageUrl(product.image)} alt={product.name} />
          </div>

          <div className="detail-info-section">
            <span className={`detail-badge badge-${product.type}`}>
              {product.type === "vino" ? "Vi" : "Cervesa"}
            </span>
            <h1 className="detail-title">{product.name}</h1>
            
            <div className="detail-meta-list">
              <div className="meta-item">
                <span className="meta-label">Origen / Regió:</span>
                <span className="meta-value">{product.origin}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Subtipus / Estil:</span>
                <span className="meta-value">{product.subType}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Graduació d'alcohol:</span>
                <span className="meta-value">{product.graduacio}% Vol.</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Disponibilitat:</span>
                <span className={`meta-value ${product.stock > 0 ? "stock-ok" : "stock-ko"}`}>
                  {product.stock > 0 ? `${product.stock} unitats en estoc` : "Sense estoc"}
                </span>
              </div>
            </div>

            <p className="detail-description">{product.description}</p>

            <div className="detail-price-section">
              <span className="detail-price">{product.price.toFixed(2)}€</span>
            </div>

            {product.stock > 0 ? (
              <div className="purchase-controls">
                <div className="qty-selector">
                  <button onClick={() => handleQtyChange(quantity - 1)} className="qty-btn">-</button>
                  <span className="qty-value">{quantity}</span>
                  <button onClick={() => handleQtyChange(quantity + 1)} className="qty-btn">+</button>
                </div>
                
                <button 
                  onClick={() => { addToCart(product, quantity); alert("S'ha afegit al carret!"); }}
                  className="btn btn-primary btn-add-cart"
                >
                  Afegir al carret
                </button>
              </div>
            ) : (
              <button disabled className="btn btn-primary w-full">Sense Estoc Disponible</button>
            )}
          </div>
        </div>
      )}

      <style>{`
        .product-detail-layout {
          display: grid;
          grid-template-columns: 1.2fr 1.5fr;
          gap: 40px;
          background-color: var(--card-bg);
          padding: 40px;
        }

        @media (max-width: 820px) {
          .product-detail-layout {
            grid-template-columns: 1fr;
            padding: 20px;
            gap: 20px;
          }
        }

        .detail-image-section {
          background-color: #f7f3eb;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          height: 380px;
          border: 1px solid var(--border-color);
        }

        .detail-image-section img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .detail-info-section {
          display: flex;
          flex-direction: column;
        }

        .detail-badge {
          align-self: flex-start;
          padding: 4px 12px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          border-radius: 20px;
          margin-bottom: 15px;
        }

        .detail-title {
          font-size: 2.2rem;
          margin-bottom: 20px;
          line-height: 1.1;
        }

        .detail-meta-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 25px;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          padding: 15px 0;
        }

        @media (max-width: 480px) {
          .detail-meta-list {
            grid-template-columns: 1fr;
          }
        }

        .meta-item {
          display: flex;
          flex-direction: column;
        }

        .meta-label {
          font-size: 0.8rem;
          color: var(--text-light);
          font-weight: 500;
        }

        .meta-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--primary);
        }

        .stock-ok { color: var(--success); }
        .stock-ko { color: var(--danger); }

        .detail-description {
          font-size: 1rem;
          color: var(--text-dark);
          line-height: 1.6;
          margin-bottom: 30px;
        }

        .detail-price-section {
          margin-bottom: 30px;
        }

        .detail-price {
          font-size: 2rem;
          font-family: var(--font-serif);
          color: var(--primary);
          font-weight: 700;
        }

        .purchase-controls {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .qty-selector {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          overflow: hidden;
          background-color: var(--bg-color);
        }

        .qty-btn {
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          color: var(--primary);
          transition: var(--transition);
        }

        .qty-btn:hover {
          background-color: var(--border-color);
        }

        .qty-value {
          width: 40px;
          text-align: center;
          font-weight: 600;
          font-size: 1rem;
        }

        .btn-add-cart {
          flex: 1;
          height: 40px;
        }

        .error-detail-card {
          padding: 40px;
          text-align: center;
          border-color: rgba(178, 59, 59, 0.2);
        }

        .error-detail-card h2 {
          color: var(--danger);
          margin-bottom: 10px;
        }
      `}</style>
    </main>
  );
};

export default ProductDetail;
