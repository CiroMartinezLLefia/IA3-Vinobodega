const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const USERS_FILE = path.join(__dirname, "../data_users.json");
const PRODUCTS_FILE = path.join(__dirname, "../data_products.json");
const ORDERS_FILE = path.join(__dirname, "../data_orders.json");

// Helper to load JSON safely
const readJSON = (filePath, defaultData = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf8");
      return defaultData;
    }
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return defaultData;
  }
};

// Helper to save JSON safely
const writeJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
  }
};

// In-memory collections backed by JSON files
const fallbackStore = {
  // --- USERS ---
  getUsers: () => readJSON(USERS_FILE),
  saveUsers: (users) => writeJSON(USERS_FILE, users),
  
  createUser: async (userData) => {
    const users = fallbackStore.getUsers();
    
    // Hash password if not already hashed
    let password = userData.password;
    if (!password.startsWith("$2a$") && !password.startsWith("$2b$")) {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
    }

    const newUser = {
      _id: userData._id || String(Date.now() + Math.random().toString(36).substr(2, 9)),
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      password: password,
      photo: userData.photo || "",
      role: userData.role || "usuari",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    fallbackStore.saveUsers(users);
    return newUser;
  },

  findUserByEmail: (email) => {
    const users = fallbackStore.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  },

  findUserById: (id) => {
    const users = fallbackStore.getUsers();
    return users.find(u => String(u._id) === String(id));
  },

  updateUserRole: (id, role) => {
    const users = fallbackStore.getUsers();
    const userIndex = users.findIndex(u => String(u._id) === String(id));
    if (userIndex === -1) return null;
    users[userIndex].role = role;
    users[userIndex].updatedAt = new Date().toISOString();
    fallbackStore.saveUsers(users);
    return users[userIndex];
  },

  updateUserProfile: (id, { name, photo }) => {
    const users = fallbackStore.getUsers();
    const userIndex = users.findIndex(u => String(u._id) === String(id));
    if (userIndex === -1) return null;
    if (name !== undefined) users[userIndex].name = name;
    if (photo !== undefined) users[userIndex].photo = photo;
    users[userIndex].updatedAt = new Date().toISOString();
    fallbackStore.saveUsers(users);
    return users[userIndex];
  },

  // --- PRODUCTS ---
  getProducts: () => {
    // If empty, initialize with default products to meet test guidelines!
    const products = readJSON(PRODUCTS_FILE);
    if (products.length === 0) {
      const defaultProducts = [
        {
          _id: "p1",
          name: "Tempranillo Reserva 2020",
          description: "Un vi negre elegant amb notes de fruita vermella madura i fusta de roure.",
          price: 18.5,
          image: "/uploads/tempranillo.jpg",
          type: "vino",
          graduacio: 14,
          subType: "Negre Criança",
          origin: "Rioja",
          stock: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: "p2",
          name: "IPA Artesana La Brava",
          description: "Cervesa artesana estil IPA amb aromes cítriques i un amargor equilibrat.",
          price: 3.2,
          image: "/uploads/ipa.jpg",
          type: "cerveza",
          graduacio: 6.2,
          subType: "IPA",
          origin: "Catalunya",
          stock: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      writeJSON(PRODUCTS_FILE, defaultProducts);
      return defaultProducts;
    }
    return products;
  },

  saveProducts: (products) => writeJSON(PRODUCTS_FILE, products),

  createProduct: (productData) => {
    const products = fallbackStore.getProducts();
    const newProduct = {
      _id: productData._id || String(Date.now() + Math.random().toString(36).substr(2, 9)),
      name: productData.name,
      description: productData.description,
      price: Number(productData.price),
      image: productData.image || "",
      type: productData.type,
      graduacio: Number(productData.graduacio),
      subType: productData.subType,
      origin: productData.origin,
      stock: Number(productData.stock || 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    products.push(newProduct);
    fallbackStore.saveProducts(products);
    return newProduct;
  },

  findProductById: (id) => {
    const products = fallbackStore.getProducts();
    return products.find(p => String(p._id) === String(id));
  },

  updateProduct: (id, productData) => {
    const products = fallbackStore.getProducts();
    const index = products.findIndex(p => String(p._id) === String(id));
    if (index === -1) return null;
    products[index] = {
      ...products[index],
      ...productData,
      price: productData.price !== undefined ? Number(productData.price) : products[index].price,
      graduacio: productData.graduacio !== undefined ? Number(productData.graduacio) : products[index].graduacio,
      stock: productData.stock !== undefined ? Number(productData.stock) : products[index].stock,
      updatedAt: new Date().toISOString()
    };
    fallbackStore.saveProducts(products);
    return products[index];
  },

  deleteProduct: (id) => {
    const products = fallbackStore.getProducts();
    const index = products.findIndex(p => String(p._id) === String(id));
    if (index === -1) return false;
    products.splice(index, 1);
    fallbackStore.saveProducts(products);
    return true;
  },

  // --- ORDERS ---
  getOrders: () => readJSON(ORDERS_FILE),
  saveOrders: (orders) => writeJSON(ORDERS_FILE, orders),

  createOrder: (orderData) => {
    const orders = fallbackStore.getOrders();
    const newOrder = {
      _id: String(Date.now() + Math.random().toString(36).substr(2, 9)),
      user: orderData.user, // String ID of user
      items: orderData.items.map(item => ({
        product: item.product, // String ID of product
        quantity: Number(item.quantity),
        price: Number(item.price)
      })),
      totalPrice: Number(orderData.totalPrice),
      status: orderData.status || "pendent",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    orders.push(newOrder);
    fallbackStore.saveOrders(orders);
    return newOrder;
  },

  getOrdersByUser: (userId) => {
    const orders = fallbackStore.getOrders();
    const products = fallbackStore.getProducts();
    return orders
      .filter(o => String(o.user) === String(userId))
      .map(o => ({
        ...o,
        items: o.items.map(item => ({
          ...item,
          product: products.find(p => String(p._id) === String(item.product)) || { name: "Producte desconegut" }
        }))
      }));
  }
};

module.exports = fallbackStore;
