/**
 * Code generated using AI with edits
 * 
 * Checkout page, takes in data from the user to buy items in their cart
 */
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import cartData from './cartData';
import './CataloguePage.css';
import arceusImage from '/images/PokemonLegendsArceus.jpg';
import scarletImage from '/images/Pokemon Scarlet.jpg';
import swordImage from '/images/Pokemon Sword.jpg';

// Sample product list
const products = [
  {
    name: "Pokemon Legends Arceus",
    price: 54.49,
    image: arceusImage,
    description: "Travel to the Hisui region and build the region's first Pokédex"
  },
  {
    name: "Pokemon Scarlet",
    price: 52.57,
    image: scarletImage,
    description: "Embark on an open-world adventure in the Paldea region"
  },
  {
    name: "Pokemon Sword",
    price: 51.99,
    image: swordImage,
    description: "Challenge Gym Leaders across the Galar region"
  },
];

function CataloguePage() {
  const [cartItems, setCartItems] = useState(cartData.items || []);
  const [animatedItem] = useState(null);

  useEffect(() => {
    // Update cart items when component mounts
    setCartItems([...cartData.items]);
  }, []);

  // // Function to add an item to the cart with animation
  // const addToCart = (product: Product, index: number) => {
  //   cartData.addItem(product);
  //   setCartItems([...cartData.items]);
    
  //   // Set animation
  //   setAnimatedItem(index);
  //   setTimeout(() => setAnimatedItem(null), 500);
  // };

  return (
    <div className="catalogue-container">
      <Link to="/Dash" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <FaArrowLeft style={{ marginRight: '0.5rem' }} /> Back to Dashboard
      </Link>
      
      <h1>Game Catalogue</h1>
      
      <div className="scroll-container">
        {products.map((product, index) => (
          <div 
            className={`item ${animatedItem === index ? 'added-animation' : ''}`} 
            key={index}
          >
            <img src={product.image} alt={product.name} />
            <div className="fields">
              <h2>{product.name}</h2>
              <h2>${product.price.toFixed(2)}</h2>
              <p>{product.description}</p>
              <div className="buttons">
                <button 
                  className="add" 
                  //onClick={() => addToCart(product, index)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3>
        <Link to="/cart">
          <button>
            <FaShoppingCart style={{ marginRight: '0.5rem' }} />
            View Cart ({cartItems.length})
          </button>
        </Link>
      </h3>
    </div>
  );
}

export default CataloguePage;