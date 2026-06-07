import React, { createContext, useState, useEffect, useContext } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const localData = localStorage.getItem("vinacoteca_cart");
    return localData ? JSON.parse(localData) : [];
  });

  useEffect(() => {
    localStorage.setItem("vinacoteca_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(item => item.product._id === product._id);
      
      if (existingItemIndex > -1) {
        const currentQty = prevCart[existingItemIndex].quantity;
        const newQty = currentQty + quantity;
        
        // Stock check
        if (newQty > product.stock) {
          alert(`Només hi ha ${product.stock} unitats en estoc per a ${product.name}`);
          return prevCart;
        }

        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity = newQty;
        return newCart;
      } else {
        // Stock check
        if (quantity > product.stock) {
          alert(`Només hi ha ${product.stock} unitats en estoc per a ${product.name}`);
          return prevCart;
        }
        return [...prevCart, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter(item => item.product._id !== productId));
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const itemIndex = prevCart.findIndex(item => item.product._id === productId);
      if (itemIndex === -1) return prevCart;

      const item = prevCart[itemIndex];
      if (newQty > item.product.stock) {
        alert(`Només hi ha ${item.product.stock} unitats en estoc per a ${item.product.name}`);
        return prevCart;
      }

      const newCart = [...prevCart];
      newCart[itemIndex].quantity = newQty;
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart s'ha de fer servir dins d'un CartProvider");
  }
  return context;
};
