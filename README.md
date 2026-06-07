# VINACOTECA - Projecte Full-Stack (React & Express)

Aquest és el projecte **VINACOTECA**, desenvolupat en una arquitectura full-stack amb un frontend en React (Vite) i un backend en Express (Node.js).

L'aplicació compta amb un catàleg de vins i cerveses, registre amb pujada de foto de perfil (Multer), inici de sessió i autorització basada en rols (usuari, editor, admin), realització de comandes, persistència de dades (MongoDB Atlas amb caiguda segura a fitxers JSON locals) i notificacions automàtiques per correu electrònic (Nodemailer).

---

## 🏗️ Arquitectura i Estructura del Projecte

El projecte es divideix en dues capes ben diferenciades i independents:

- **/backend**: API REST en Express.
  - **Models/Schemas**: Usuaris, Productes i Comandes (Mongoose).
  - **Middlewares**: Autenticació JWT (`auth.js`) i Pujada de Fitxers Multer (`upload.js`).
  - **utils/mailer.js**: Lògica d'enviament de correus amb Nodemailer.
  - **Persistència Fallback**: Si no es defineix `MONGODB_URI` a l'entorn, el sistema utilitza fitxers JSON locals (`data_users.json`, `data_products.json`, etc.) per a garantir el funcionament offline amb persistència real de dades.
- **/frontend**: Aplicació React (Vite) amb CSS natiu premium.
  - **Contexts**: Gestió global de l'estat d'autenticació (`AuthContext.jsx`) i carret de la compra (`CartContext.jsx`).
  - **Rutes**: Sistema de navegació integrat via URL hash (`#/`, `#/login`, `#/profile`, etc.), que evita incompatibilitats en servidors de contingut estàtic i suporta l'historial del navegador.

---

## ⚙️ Requisits i Variables d'Entorn

### Backend (`/backend/.env`)
Crea un fitxer `.env` a la carpeta `backend/` seguint el patró de `.env.example`:

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=super_secret_vinacoteca_key_2026
FRONTEND_URL=http://localhost:5173

# Nodemailer SMTP (Deixa-ho buit per auto-generar un compte de proves d'Ethereal Email)
MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM="Vinacoteca <noreply@vinacoteca.com>"
OWNER_EMAIL=propietari@vinacoteca.com
```

> [!TIP]
> Si les credencials de correu SMTP es deixen buides, el backend auto-generarà dinàmicament un compte gratuït de proves a **Ethereal Email** i imprimirà l'enllaç de visualització de correus a la consola cada vegada que s'enviï un correu!

### Frontend (`/frontend/.env`)
Crea un fitxer `.env` a la carpeta `frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Instal·lació i Execució

### 1. Instal·lar dependències
Executa a la carpeta arrel del projecte per a instal·lar de cop totes les dependències del workspace (del frontend, del backend i de l'arrel):

```bash
# Instal·lació de dependències del root (concurrently)
npm install

# Instal·lació a les subcarpetes
npm --prefix backend install
npm --prefix frontend install
```

### 2. Execució en mode desenvolupament
Des de la carpeta arrel, pots arrencar ambdós servidors de forma concurrent:

```bash
npm run dev
```

Això iniciarà:
- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:5173`

---

## 👥 Credencials de Prova (Opcions de registre)

Per a provar els diferents rols de l'aplicació, el formulari de registre conté un camp específic per a triar el rol desitjat del compte:

1. **Usuari Normal** (rol `usuari`): Pot consultar el catàleg, afegir productes al carret, veure el seu historial de comandes i confirmar comandes.
2. **Editor** (rol `editor`): Té accés al dashboard d'edició per fer CRUD de vins i cerveses.
3. **Administrador** (rol `admin`): Té accés a la gestió de productes (CRUD) i a la gestió de rols d'usuaris (dashboard admin).

*Nota: Pots registrar tants usuaris amb diferents fotos de perfil com vulguis des del propi frontend.*

---

## 🧪 Validació d'Endpoints (`tests.http`)

Al directori arrel trobaràs el fitxer [tests.http](file:///c:/Users/Ciro/Desktop/PracticasDAW2/IA3-Vinobodega/tests.http). Aquest fitxer conté tot el flux funcional ordenat pas a pas per a comprovar el correcte funcionament dels endpoints, codis de resposta HTTP i restriccions de rols.
