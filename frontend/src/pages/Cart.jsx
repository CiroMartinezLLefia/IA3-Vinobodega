import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Cart = ({ navigateTo }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { token, user, API_URL } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const getProductImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/150x150/f0e6df/5c3a21?text=Producte";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  const handleCheckout = async () => {
    if (!token) {
      navigateTo("login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Map cart items to API format: { product: "id", quantity: 2 }
      const itemsPayload = cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }));

      const res = await fetch(`${API_URL}/api/comandes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ items: itemsPayload })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "S'ha produït un error al processar la comanda");
      }

      setSuccess(true);
      clearCart();
      setTimeout(() => {
        navigateTo("profile");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="content">
      <h1 className="mb-20">El meu Carret de Compra 🛒</h1>

      {success && (
        <div className="alert alert-success">
          <span><strong>Comanda realitzada amb èxit!</strong> S'ha enviat un correu de notificació al propietari. Redirigint al teu perfil...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
        </div>
      )}

      {cart.length === 0 && !success ? (
        <div className="empty-cart-card card text-center">
          <h2>El teu carret està buit</h2>
          <p className="text-light mb-20">Explora el nostre catàleg i afegeix els millors vins i cerveses.</p>
          <button onClick={() => navigateTo("catalog")} className="btn btn-primary">
            Explorar Catàleg
          </button>
        </div>
      ) : !success ? (
        <div className="cart-layout">
          {/* Cart Items List */}
          <div className="cart-items-section">
            {cart.map((item) => (
              <div key={item.product._id} className="card cart-item-card mb-15">
                <img src={getProductImageUrl(item.product.image)} alt={item.product.name} className="cart-item-img" />
                
                <div className="cart-item-details">
                  <span className="cart-item-origin">{item.product.origin}</span>
                  <h3 className="cart-item-name">{item.product.name}</h3>
                  <span className="cart-item-price-each">{item.product.price.toFixed(2)}€ / unitat</span>
                </div>

                <div className="cart-item-controls">
                  <div className="qty-selector">
                    <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="qty-btn">-</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="qty-btn">+</button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.product._id)}
                    className="cart-delete-btn"
                    title="Eliminar del carret"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>

                <div className="cart-item-total">
                  <span>{(item.product.price * item.quantity).toFixed(2)}€</span>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary Section */}
          <div className="card cart-summary-card">
            <h2>Resum del Carret</h2>
            <hr className="mb-20" />
            
            <div className="summary-row mb-10">
              <span>Subtotal:</span>
              <span>{cartTotal.toFixed(2)}€</span>
            </div>
            
            <div className="summary-row mb-20">
              <span>Despeses d'enviament:</span>
              <span className="free-shipping">Gratuït</span>
            </div>

            <hr className="mb-20" />

            <div className="summary-row total-row mb-20">
              <span>Preu Total:</span>
              <span>{cartTotal.toFixed(2)}€</span>
            </div>

            {user ? (
              <button 
                onClick={handleCheckout} 
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? "Processant comanda..." : "Confirmar Comanda"}
              </button>
            ) : (
              <div className="cart-login-prompt">
                <p className="text-light mb-10 text-center">Inicia sessió per confirmar la comanda.</p>
                <button onClick={() => navigateTo("login")} className="btn btn-outline w-full">
                  Iniciar Sessió
                </button>
              </div>
            )}
            
            <button 
              onClick={clearCart} 
              disabled={loading}
              className="btn btn-outline btn-danger-text w-full mt-10"
            >
              Buidar Carret
            </button>
          </div>
        </div>
      ) : null}

      <style>{`
        .empty-cart-card {
          padding: 60px 40px;
        }

        .cart-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
          align-items: start;
        }

        @media (max-width: 820px) {
          .cart-layout {
            grid-template-columns: 1fr;
          }
        }

        .cart-item-card {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          gap: 20px;
          flex-wrap: wrap;
        }

        .cart-item-img {
          width: 70px;
          height: 70px;
          object-fit: contain;
          background-color: #f7f3eb;
          padding: 5px;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--border-color);
        }

        .cart-item-details {
          flex: 2;
          min-width: 150px;
        }

        .cart-item-origin {
          font-size: 0.75rem;
          color: var(--secondary);
          text-transform: uppercase;
          font-weight: 700;
        }

        .cart-item-name {
          font-size: 1.1rem;
          margin-bottom: 2px;
        }

        .cart-item-price-each {
          font-size: 0.8rem;
          color: var(--text-light);
        }

        .cart-item-controls {
          display: flex;
          align-items: center;
          gap: 15px;
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
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          color: var(--primary);
        }

        .qty-btn:hover {
          background-color: var(--border-color);
        }

        .qty-value {
          width: 30px;
          text-align: center;
          font-weight: 600;
        }

        .cart-delete-btn {
          background: transparent;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          transition: var(--transition);
          display: flex;
          align-items: center;
        }

        .cart-delete-btn:hover {
          color: var(--danger);
          background-color: #fdf2f2;
        }

        .cart-item-total {
          font-family: var(--font-serif);
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--primary);
          min-width: 80px;
          text-align: right;
        }

        @media (max-width: 580px) {
          .cart-item-card {
            flex-direction: column;
            text-align: center;
          }
          
          .cart-item-total {
            text-align: center;
            width: 100%;
          }
        }

        /* Summary Card */
        .cart-summary-card {
          padding: 30px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
        }

        .free-shipping {
          color: var(--success);
          font-weight: 600;
        }

        .total-row {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary);
        }

        .btn-danger-text {
          border-color: rgba(178, 59, 59, 0.3);
          color: var(--danger);
        }

        .btn-danger-text:hover {
          background-color: #fdf2f2;
        }
      `}</style>
    </main>
  );
};

export default Cart;
