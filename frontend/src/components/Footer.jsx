import React from "react";

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>BODEGA SELECTT</h3>
          <p>La millor selecció de vins de reserva i cerveses artesanes premium del país.</p>
        </div>
        <div className="footer-links">
          <h4>Enllaços</h4>
          <ul>
            <li><a href="#/">Catàleg de Vins i Cerveses</a></li>
            <li><a href="#/about">Sobre Nosaltres</a></li>
            <li><a href="#/contact">Contacte</a></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4>Subscriu-te a la nostra Newsletter</h4>
          <p className="mb-10">Rep ofertes i novetats exclusives directament a la teva bústia.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="El teu email" className="form-control newsletter-input" />
            <button className="btn btn-secondary">Subscriure'm</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Bodega Selectt. Tots els drets reservats. Projecte Acadèmic VINACOTECA.</p>
      </div>

      <style>{`
        .footer-container {
          background-color: #2b1a0e;
          color: #d8ceca;
          padding: 60px 20px 20px 20px;
          border-top: 5px solid var(--accent);
          margin-top: auto;
        }

        .footer-content {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.5fr;
          gap: 40px;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        .footer-brand h3, .footer-links h4, .footer-contact h4 {
          color: var(--accent);
          font-family: var(--font-serif);
          margin-bottom: 15px;
        }

        .footer-brand p {
          font-size: 0.9rem;
          line-height: 1.6;
          max-width: 300px;
        }

        .footer-links ul {
          list-style: none;
        }

        .footer-links li {
          margin-bottom: 10px;
        }

        .footer-links a {
          color: #d8ceca;
          font-size: 0.9rem;
        }

        .footer-links a:hover {
          color: var(--accent);
        }

        .newsletter-form {
          display: flex;
          gap: 10px;
        }

        .newsletter-input {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #fff !important;
        }

        .footer-bottom {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          text-align: center;
          padding-top: 20px;
          font-size: 0.8rem;
          color: #8c7f7a;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
