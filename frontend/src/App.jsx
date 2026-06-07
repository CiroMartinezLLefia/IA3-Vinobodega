import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import EditorDashboard from "./pages/EditorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

function AppContent() {
  const [route, setRoute] = useState("catalog"); // catalog, about, login, register, profile, cart, editor, admin, productDetail
  const [productId, setProductId] = useState("");

  // Watch URL hashes for clean routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash || hash === "#/" || hash === "") {
        setRoute("catalog");
      } else if (hash === "#/about") {
        setRoute("about");
      } else if (hash === "#/login") {
        setRoute("login");
      } else if (hash === "#/register") {
        setRoute("register");
      } else if (hash === "#/profile") {
        setRoute("profile");
      } else if (hash === "#/cart") {
        setRoute("cart");
      } else if (hash === "#/editor") {
        setRoute("editor");
      } else if (hash === "#/admin") {
        setRoute("admin");
      } else if (hash.startsWith("#/product/")) {
        const id = hash.replace("#/product/", "");
        setProductId(id);
        setRoute("productDetail");
      } else {
        setRoute("catalog");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // run on start

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const navigateTo = (destination) => {
    if (destination === "catalog") {
      window.location.hash = "#/";
    } else if (destination.startsWith("product-")) {
      const id = destination.replace("product-", "");
      window.location.hash = `#/product/${id}`;
    } else {
      window.location.hash = `#/${destination}`;
    }
  };

  const renderPage = () => {
    switch (route) {
      case "catalog":
        return <Catalog navigateTo={navigateTo} />;
      case "productDetail":
        return <ProductDetail productId={productId} navigateTo={navigateTo} />;
      case "login":
        return <Login navigateTo={navigateTo} />;
      case "register":
        return <Register navigateTo={navigateTo} />;
      case "profile":
        return <Profile navigateTo={navigateTo} />;
      case "cart":
        return <Cart navigateTo={navigateTo} />;
      case "editor":
        return <EditorDashboard navigateTo={navigateTo} />;
      case "admin":
        return <AdminDashboard navigateTo={navigateTo} />;
      case "about":
        return <About />;
      default:
        return <Catalog navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar currentRoute={route} navigateTo={navigateTo} />
      {renderPage()}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
