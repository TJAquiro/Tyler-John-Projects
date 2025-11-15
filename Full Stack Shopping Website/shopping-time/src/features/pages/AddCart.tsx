import { useState } from 'react'; // No need to import React explicitly in newer versions
import { Link } from "react-router-dom";
import cartData from './cartData'; // Import the shared cart structure
import './AddCart.css';
import arceusImage from './PokemonLegendsArceus.jpg';
import scarletImage from './Pokemon Scarlet.jpg';
import swordImage from './Pokemon Sword.jpg';
// Sample product list
const products = [
  {
    name: "Pokemon Legends Arceus",
    price: 54.49,
    image: arceusImage,
  },
  {
    name: "Pokemon Scarlet",
    price: 52.57,
    image: scarletImage,
  },
  {
    name: "Pokemon Sword",
    price: 51.99,
    image: swordImage,
  },
];

function AddCart() {
  const [cartItems, setCartItems] = useState(cartData.items || []);

  // Function to add an item to the cart
  const addToCart = (product:any) => {
    cartData.addItem(product); // Add item to shared cart data
    setCartItems([...cartData.items]); // Update state
  };

  return (
    <>
      <h1>Catalogue</h1>
      <div className="scroll-container">
        {products.map((product, index) => (
          <div className="item" key={index}>
            <img src={product.image} alt={product.name} width="300" height="200" />
            <div className="fields">
              <h2>{product.name}</h2>
              <h2>${product.price.toFixed(2)}</h2>
              <div className="buttons">
                <button className="add" onClick={() => addToCart(product)}>Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Link to Cart Page */}
      <h3>
        <Link to="/cart">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            Cart ({cartItems.length})
          </button>
        </Link>
      </h3>
    </>
  );
}

export default AddCart;
