import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = ({ currentRoute, navigateTo }) => {
  const { user, logout, API_URL } = useAuth();
  const { cartCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getAvatarUrl = (photoPath) => {
    if (!photoPath) return "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
    if (photoPath.startsWith("http")) return photoPath;
    return `${API_URL}${photoPath}`;
  };

  const handleLinkClick = (e, route) => {
    e.preventDefault();
    navigateTo(route);
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <a href="#/" onClick={(e) => handleLinkClick(e, "catalog")} className="nav-brand">
          <span>BODEGA</span> <span className="gold-text">SELECTT</span>
        </a>

        <div className="nav-links">
          <a href="#/" onClick={(e) => handleLinkClick(e, "catalog")} className={currentRoute === "catalog" ? "active" : ""}>
            Catàleg
          </a>
          <a href="#/about" onClick={(e) => handleLinkClick(e, "about")} className={currentRoute === "about" ? "active" : ""}>
            Sobre nosaltres
          </a>
        </div>

        <div className="nav-actions">
          {/* Cart Icon */}
          <a href="#/cart" onClick={(e) => handleLinkClick(e, "cart")} className="nav-cart-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </a>

          {/* User Auth Section */}
          {user ? (
            <div className="user-dropdown-wrapper">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="user-profile-trigger">
                <img src={getAvatarUrl(user.photo)} alt={user.name} className="nav-avatar" />
                <span className="nav-user-name">{user.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>

              {dropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <span className="dropdown-role">{user.role.toUpperCase()}</span>
                  </div>
                  
                  <a href="#/profile" onClick={(e) => handleLinkClick(e, "profile")}>
                    El meu perfil i comandes
                  </a>

                  {user.role === "admin" && (
                    <a href="#/admin" onClick={(e) => handleLinkClick(e, "admin")}>
                      Dashboard Admin
                    </a>
                  )}

                  {(user.role === "editor" || user.role === "admin") && (
                    <a href="#/editor" onClick={(e) => handleLinkClick(e, "editor")}>
                      Dashboard Editor
                    </a>
                  )}

                  <hr />
                  <button onClick={() => { logout(); navigateTo("catalog"); setDropdownOpen(false); }} className="dropdown-logout-btn">
                    Tanca la sessió
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <a href="#/login" onClick={(e) => handleLinkClick(e, "login")} className="btn btn-outline btn-sm">
                Accedir
              </a>
              <a href="#/register" onClick={(e) => handleLinkClick(e, "register")} className="btn btn-primary btn-sm">
                Registrar-se
              </a>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navbar-container {
          background-color: var(--primary);
          color: var(--text-white);
          border-bottom: 3px solid var(--accent);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: var(--shadow-sm);
        }

        .navbar-content {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 20px;
        }

        .nav-brand {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: var(--text-white);
        }

        .gold-text {
          color: var(--accent);
        }

        .nav-links {
          display: flex;
          gap: 24px;
        }

        .nav-links a {
          color: #d8ceca;
          font-size: 0.95rem;
          font-weight: 500;
          position: relative;
          padding-bottom: 4px;
        }

        .nav-links a:hover, .nav-links a.active {
          color: var(--text-white);
        }

        .nav-links a.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--accent);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .nav-cart-btn {
          color: #d8ceca;
          position: relative;
          display: flex;
          align-items: center;
          padding: 6px;
          border-radius: 50%;
          transition: var(--transition);
        }

        .nav-cart-btn:hover {
          color: var(--text-white);
          background-color: rgba(255, 255, 255, 0.05);
        }

        .cart-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background-color: var(--accent);
          color: var(--primary);
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-dropdown-wrapper {
          position: relative;
        }

        .user-profile-trigger {
          background: transparent;
          border: none;
          color: var(--text-white);
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: var(--border-radius-sm);
          transition: var(--transition);
        }

        .user-profile-trigger:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .nav-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--accent);
        }

        .nav-user-name {
          font-weight: 500;
          font-size: 0.95rem;
        }

        .user-dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 10px;
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-lg);
          border-radius: var(--border-radius-sm);
          width: 220px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 105;
        }

        .dropdown-header {
          padding: 12px 16px;
          background-color: #f7f3eb;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
        }

        .dropdown-role {
          font-size: 0.75rem;
          color: var(--secondary);
          font-weight: 700;
          margin-top: 2px;
        }

        .user-dropdown-menu a, .user-dropdown-menu button {
          padding: 10px 16px;
          font-size: 0.9rem;
          color: var(--text-dark);
          text-align: left;
          width: 100%;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: var(--transition);
          display: block;
        }

        .user-dropdown-menu a:hover {
          background-color: #f7f3eb;
          color: var(--primary);
        }

        .dropdown-logout-btn {
          color: var(--danger) !important;
        }

        .dropdown-logout-btn:hover {
          background-color: #fdf2f2 !important;
        }

        .nav-auth-buttons {
          display: flex;
          gap: 10px;
        }

        .btn-sm {
          padding: 6px 14px;
          font-size: 0.85rem;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
