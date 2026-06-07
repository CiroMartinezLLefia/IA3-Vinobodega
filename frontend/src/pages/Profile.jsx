import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Profile = ({ navigateTo }) => {
  const { user, token, logout, API_URL } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  useEffect(() => {
    // If not logged in, redirect to login page (protected client route)
    if (!token) {
      navigateTo("login");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await fetch(`${API_URL}/api/comandes/me`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error("No s'ha pogut carregar l'historial de comandes");
        }

        const data = await res.json();
        setOrders(data);
        setOrdersError(null);
      } catch (err) {
        console.error(err);
        setOrdersError("Error connectant amb el servidor per carregar comandes");
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [token, API_URL, navigateTo]);

  const getAvatarUrl = (photoPath) => {
    if (!photoPath) return "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
    if (photoPath.startsWith("http")) return photoPath;
    return `${API_URL}${photoPath}`;
  };

  if (!user) return null;

  return (
    <main className="content">
      <h1 className="mb-20">El meu compte 🍷</h1>

      <div className="profile-grid">
        {/* User Card Info */}
        <div className="card profile-card">
          <div className="profile-card-header">
            <img src={getAvatarUrl(user.photo)} alt={user.name} className="profile-large-avatar" />
            <h2>{user.name}</h2>
            <span className="profile-role-badge">{user.role}</span>
          </div>

          <div className="profile-card-details">
            <div className="detail-row">
              <span className="detail-title">Email:</span>
              <span className="detail-text">{user.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-title">Compte creat:</span>
              <span className="detail-text">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Avui"}
              </span>
            </div>
          </div>

          <button onClick={() => { logout(); navigateTo("catalog"); }} className="btn btn-outline w-full mt-20">
            Tancar Sessió
          </button>
        </div>

        {/* Order History */}
        <div className="orders-section">
          <h2>Historial de Comandes</h2>

          {loadingOrders ? (
            <div className="text-center mt-20">
              <div className="spinner" style={{ width: "30px", height: "30px" }}></div>
              <p>Carregant comandes...</p>
            </div>
          ) : ordersError ? (
            <div className="alert alert-danger mt-20">
              <span>{ordersError}</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-orders-card card mt-20">
              <p>Encara no has realitzat cap comanda.</p>
              <button onClick={() => navigateTo("catalog")} className="btn btn-primary mt-10">
                Veure Catàleg
              </button>
            </div>
          ) : (
            <div className="orders-list mt-20">
              {orders.map((order) => (
                <div key={order._id} className="card order-item-card mb-20">
                  <div className="order-header">
                    <div>
                      <span className="order-id">Comanda ID: <code>{order._id}</code></span>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="order-body">
                    <ul className="order-products-list">
                      {order.items.map((item, index) => (
                        <li key={index} className="order-product-row">
                          <span>
                            <strong>{item.productName || item.product?.name || "Producte desconegut"}</strong> x {item.quantity}
                          </span>
                          <span>{(item.price * item.quantity).toFixed(2)}€</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="order-footer">
                    <span>Total de la comanda:</span>
                    <span className="order-total-price">{order.totalPrice.toFixed(2)}€</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 30px;
          align-items: start;
        }

        @media (max-width: 820px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }

        .profile-card {
          padding: 30px;
          text-align: center;
        }

        .profile-card-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 25px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 20px;
        }

        .profile-large-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--accent);
          margin-bottom: 15px;
          box-shadow: var(--shadow-sm);
        }

        .profile-role-badge {
          background-color: var(--accent-light);
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 20px;
          letter-spacing: 0.5px;
          margin-top: 5px;
        }

        .profile-card-details {
          text-align: left;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dashed var(--border-color);
        }

        .detail-title {
          font-weight: 600;
          color: var(--text-light);
          font-size: 0.9rem;
        }

        .detail-text {
          color: var(--text-dark);
          font-size: 0.95rem;
        }

        .empty-orders-card {
          padding: 40px;
          text-align: center;
          color: var(--text-light);
        }

        /* Order Cards */
        .order-item-card {
          overflow: hidden;
        }

        .order-header {
          background-color: #f7f3eb;
          padding: 15px 20px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .order-id {
          font-size: 0.85rem;
          color: var(--text-dark);
          display: block;
        }

        .order-date {
          font-size: 0.8rem;
          color: var(--text-light);
        }

        .status-badge {
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .status-pendent {
          background-color: #fef3c7;
          color: #d97706;
        }

        .status-enviat {
          background-color: #dbeafe;
          color: #2563eb;
        }

        .status-completat {
          background-color: #d1fae5;
          color: #059669;
        }

        .order-body {
          padding: 15px 20px;
        }

        .order-products-list {
          list-style: none;
        }

        .order-product-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          padding: 6px 0;
          border-bottom: 1px dashed #f0ece5;
        }

        .order-product-row:last-child {
          border-bottom: none;
        }

        .order-footer {
          background-color: #fbf9f4;
          padding: 12px 20px;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          font-weight: 600;
        }

        .order-total-price {
          color: var(--primary);
          font-family: var(--font-serif);
          font-size: 1.15rem;
        }
      `}</style>
    </main>
  );
};

export default Profile;
