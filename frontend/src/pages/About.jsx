import React from "react";

const About = () => {
  return (
    <main className="content">
      <div className="about-layout card">
        <div className="about-content">
          <h1>Bodega Selectt 🍷</h1>
          <p className="lead">Des de 1926, oferint la millor experiència vinícola i cervesera als nostres clients.</p>
          <p>La nostra passió és seleccionar vins excel·lents de denominacions d'origen de prestigi internacional i cerveses artesanals elaborades amb ingredients naturals i processos tradicionals.</p>
          <p>Creiem que cada ampolla explica una història: la del terra on creix el raïm o l'ordi, la del clima que la modela i la de les mans expertes que la cullen i elaboren. Per això, el nostre equip de sommeliers viatja arreu per portar només el millor al teu celler.</p>
          
          <h3 className="mt-20">On som?</h3>
          <p>Carrer de la Vinya, 45, Barcelona, Catalunya</p>
          <p>Telèfon: +34 93 123 45 67 | Email: info@bodegaselectt.com</p>
        </div>
        <div className="about-image-section">
          <img src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800" alt="Celler de botes" />
        </div>
      </div>

      <style>{`
        .about-layout {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          padding: 40px;
          background-color: var(--card-bg);
        }

        @media (max-width: 768px) {
          .about-layout {
            grid-template-columns: 1fr;
            padding: 20px;
          }
        }

        .lead {
          font-size: 1.2rem;
          font-weight: 500;
          color: var(--secondary);
          margin-bottom: 20px;
        }

        .about-content p {
          margin-bottom: 15px;
          line-height: 1.7;
        }

        .about-image-section {
          border-radius: var(--border-radius-md);
          overflow: hidden;
          height: 350px;
        }

        .about-image-section img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </main>
  );
};

export default About;
