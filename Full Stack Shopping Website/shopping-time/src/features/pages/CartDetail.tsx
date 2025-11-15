import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import oliveShirt from "/images/oliveShirt.jpeg";
import black_hoodie from "/images/black_hoodiejpg.webp";
import navyhoodie from "/images/navyhoodie.webp";
import arceusImage from '/images/PokemonLegendsArceus.jpg';
import scarletImage from '/images/Pokemon Scarlet.jpg';
import swordImage from '/images/Pokemon Sword.jpg';

import "./Dashboard.css";
import "./CartDetail.css";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, name: "Olive T-Shirt", price: 50, quantity: 1, imageUrl: oliveShirt },
    { id: 2, name: "Black Hoodie", price: 30, quantity: 1, imageUrl: black_hoodie },
    { id: 3, name: "Navy Hoodie", price: 35, quantity: 1, imageUrl: navyhoodie },
    { id: 4, name: "Pokemon Legends Arceus", price: 54.49, quantity: 1, imageUrl: arceusImage },
    { id: 5, name: "Pokemon Scarlet", price: 52.57, quantity: 1, imageUrl: scarletImage },
    { id: 6, name: "Pokemon Sword", price: 51.99, quantity: 1, imageUrl: swordImage },
  ]);

  const [removedItem, setRemovedItem] = useState<CartItem | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);

  // Increase item quantity
  const increaseQuantity = (id: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  // Decrease item quantity (ensure it doesn't go below 1)
  const decreaseQuantity = (id: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  // Remove item from cart with undo option
  const removeItem = (id: number) => {
    const itemToRemove = cartItems.find(item => item.id === id);
    if (!itemToRemove) return;

    setRemovedItem(itemToRemove);
    setCartItems(cartItems.filter(item => item.id !== id));

    // Set a timeout to permanently remove the item after 5 seconds
    const timeout = setTimeout(() => {
      setRemovedItem(null);
    }, 5000);
    
    setUndoTimeout(timeout);
  };

  // Undo item removal
  const undoRemove = () => {
    if (removedItem) {
      setCartItems([...cartItems, removedItem]);
      setRemovedItem(null);

      // Clear the timeout to prevent deletion
      if (undoTimeout) clearTimeout(undoTimeout);
    }
  };

  // Calculate total dynamically
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <Link to="/Dash" className="back-link">
        <FaArrowLeft style={{ marginRight: '0.5rem' }} /> Back to Dashboard
      </Link>
      
      <header className="cart-header">
        <h1>My Cart</h1>
      </header>

      <section className="cart-items">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.imageUrl} alt={item.name} />
              <div className="cart-item-info">
                <h2>{item.name}</h2>
                <p>${item.price.toFixed(2)}</p>
                <div className="quantity-controls">
                  <button onClick={() => decreaseQuantity(item.id)}><FaMinus /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQuantity(item.id)}><FaPlus /></button>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)}><FaTrash /></button>
            </div>
          ))
        ) : (
          <p className="empty-cart">Your cart is empty. <Link to="/addcart" style={{color: 'white', textDecoration: 'underline'}}>Continue shopping</Link></p>
        )}
      </section>

      {/* Undo Removal Notification */}
      {removedItem && (
        <div className="undo-remove">
          <p>Item removed: {removedItem.name}. <button onClick={undoRemove}>Undo</button></p>
        </div>
      )}

      {cartItems.length > 0 && (
        <section className="cart-summary">
          <h3>Cart Summary</h3>
          <p>Total: ${totalPrice.toFixed(2)}</p>

          <Link to="/Checkout">
            <button>
              Proceed to Checkout
            </button>
          </Link>
        </section>
      )}
    </div>
  );
};

export default CartPage;