import React, { useState, useEffect } from 'react';
import cartData from './cartData';
import purchaseData from './purchases'; 
import './Cart.css';

function Cart() {
  const [cartItems, setCartItems] = useState(cartData.items || []);

  useEffect(() => {
    setCartItems([...cartData.items]);
  }, []);

  const purchaseItem = (item:any,index:number) => {
    purchaseData.addItem(item); 
    cartData.removeItem(index);
    setCartItems([...cartData.items]);
  };
  
  const removeItem = (index: number) => {
    cartData.removeItem(index);
    setCartItems([...cartData.items]);
  };

  const purchaseAll = () => {
    cartData.items.forEach((item: any) => purchaseData.addItem(item)); 
    cartData.clearCart();
    setCartItems([]);
    alert("Thank you for your purchase!");
  };

  return (
    <React.Fragment>
      <h1>Cart</h1>
      <div className="scroll-container">
        {cartItems.length > 0 ? cartItems.map((item: any, index: number) => (
          <div className="item" key={index}>
            <img src={item.image || ""} alt={item.name || "Unknown"} width="100" height="150" />
            <div className="fields">
              <h2>{item.name || "No Name"}</h2>
              <h2>${item.price ? item.price.toFixed(2) : "0.00"}</h2>
              <div className="buttons">
                <button className="purchase-btn" onClick={() => purchaseItem(item, index)}>Purchase</button>
                <button className="delete-btn" onClick={() => removeItem(index)}>Delete</button>
              </div>
            </div>
          </div>
        )) : <h2>Your cart is empty</h2>}
      </div>

      {cartItems.length > 0 && (
        <div className="purchase-all-container">
          <button className="purchase-all-btn" onClick={purchaseAll}>Purchase All</button>
        </div>
      )}
    </React.Fragment>
  );
}

export default Cart;
