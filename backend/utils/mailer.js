const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.MAIL_HOST;
  const port = process.env.MAIL_PORT;
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  // Use configured credentials if they are provided
  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: Number(port) === 465,
      auth: { user, pass }
    });
    console.log("✉️ Nodemailer configurat amb servidor SMTP proveït.");
  } else {
    // If not configured, auto-generate an Ethereal test account
    console.log("✉️ Creant compte de prova Ethereal Email per defecte...");
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`✉️ Compte de prova d'Ethereal Email creat: ${testAccount.user}`);
    } catch (err) {
      console.warn("⚠️ No s'ha pogut auto-configurar Ethereal Email. Fent servir mock per consola.", err.message);
      // Dummy mock transporter
      transporter = {
        sendMail: async (mailOptions) => {
          console.log("📧 [MOCK EMAIL] --- ENVIAMENT DE CORREU INTERCEPTAT ---");
          console.log("📧 De:", mailOptions.from);
          console.log("📧 Per a:", mailOptions.to);
          console.log("📧 Assumpte:", mailOptions.subject);
          console.log("📧 Cos del missatge:\n", mailOptions.text);
          console.log("📧 ---------------------------------------------");
          return { messageId: "mock-message-id-" + Date.now(), messageUrl: "#" };
        }
      };
    }
  }
  return transporter;
};

const sendOrderNotification = async (order, userDetails) => {
  const mailTo = process.env.OWNER_EMAIL || "propietari@vinacoteca.com";
  const mailFrom = process.env.MAIL_FROM || '"Vinacoteca" <noreply@vinacoteca.com>';

  const itemsListText = order.items
    .map(item => `- ${item.productName || item.product} x ${item.quantity} (Preu: ${item.price}€ / u)`)
    .join("\n");

  const mailOptions = {
    from: mailFrom,
    to: mailTo,
    subject: `Nova comanda rebuda - Vinacoteca`,
    text: `Hola Propietari,

S'ha registrat una nova comanda a la vinacoteca.

Dades del client:
- Nom: ${userDetails.name}
- Email: ${userDetails.email}
- Rol: ${userDetails.role}

Resum de la comanda:
- ID de la comanda: ${order._id}
- Data: ${new Date(order.createdAt).toLocaleString()}
- Productes demanats:
${itemsListText}

- Preu Total: ${order.totalPrice.toFixed(2)}€
- Estat: ${order.status}

Si us plau, prepara els productes de la comanda.

Salutacions,
Sistema de Vinacoteca.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #fdfbf7;">
        <h2 style="color: #5c3a21; border-bottom: 2px solid #5c3a21; padding-bottom: 10px;">Nova comanda rebuda 🍷</h2>
        <p>Hola Propietari,</p>
        <p>S'ha registrat una nova comanda a la plataforma.</p>
        
        <h3 style="color: #8d5b4c;">Dades del client:</h3>
        <ul>
          <li><strong>Nom:</strong> ${userDetails.name}</li>
          <li><strong>Email:</strong> ${userDetails.email}</li>
          <li><strong>Rol:</strong> ${userDetails.role}</li>
        </ul>
        
        <h3 style="color: #8d5b4c;">Resum de la comanda:</h3>
        <ul>
          <li><strong>ID de la comanda:</strong> <code>${order._id}</code></li>
          <li><strong>Data:</strong> ${new Date(order.createdAt).toLocaleString()}</li>
          <li><strong>Estat:</strong> <span style="background-color: #f0e6df; color: #8d5b4c; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${order.status}</span></li>
        </ul>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background-color: #5c3a21; color: #fff;">
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Producte</th>
              <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Quantitat</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Preu</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${item.productName || item.product}</td>
                <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${item.price.toFixed(2)}€</td>
              </tr>
            `).join("")}
            <tr style="font-weight: bold; background-color: #f5ece5;">
              <td colspan="2" style="padding: 8px; text-align: right; border: 1px solid #ddd;">Total:</td>
              <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${order.totalPrice.toFixed(2)}€</td>
            </tr>
          </tbody>
        </table>
        
        <p style="margin-top: 20px; font-size: 0.9em; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
          Aquest correu s'ha generat automàticament des del backend de la Vinacoteca.
        </p>
      </div>
    `
  };

  try {
    const client = await getTransporter();
    const info = await client.sendMail(mailOptions);
    console.log(`✉️ Correu enviat satisfactòriament: ${info.messageId}`);
    if (info.messageUrl && info.messageUrl !== "#") {
      console.log(`🔗 Enllaç per veure el correu d'Ethereal: ${info.messageUrl}`);
    }
    return { success: true, messageId: info.messageId, url: info.messageUrl };
  } catch (error) {
    console.error("❌ Error enviant la notificació per correu:", error.message);
    // Silent catch as requested by criteria: "Si SMTP falla, el sistema respon de manera controlada (error gestionat i/o log clar)"
    return { success: false, error: error.message };
  }
};

module.exports = { sendOrderNotification };
