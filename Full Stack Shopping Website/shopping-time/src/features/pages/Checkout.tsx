import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';
import { useAuth } from '../auth/AuthContext';
import Customer from '../../types/Customer';
import { getProductsByShopId } from '../../api/productApi';
import Product from '../../types/Product';
import { createTransaction } from '../../api/transactionApi';
import Transaction from '../../types/Transaction';
import { getCustomerById, updateCustomerCart } from '../../api/customerApi';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialCustomer = user as Customer;

  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const [cartItems, setCartItems] = useState<(Product & { quantity: number; total: number })[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [transactionMessage] = useState<string>('');
  const [firstName, setFirstName] = useState(customer?.firstName);
  const [lastName, setLastName] = useState(customer?.lastName);
  const [cardNumberError, setCardNumberError] = useState('');
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(false);

  const [shipping, setShipping] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
    instructions: ''
  });

  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    securityCode: '',
    pin: '',
    type: '',
    billingAddress: '',
    cardHolder: '',
    expirationDate: ''
  });

  useEffect(() => {
    loadCustomer();
  }, []);

  useEffect(() => {
    if (customer?.shopId) {
      loadCartItems();
    }
  }, [customer]);

  const loadCustomer = async () => {
    try {
      const updatedCustomer = await getCustomerById(initialCustomer.id);
      setCustomer(updatedCustomer);
    } catch (error) {
      console.error("Failed to refresh customer", error);
    }
  };

  const loadCartItems = async () => {
    try {
      const products: Product[] = await getProductsByShopId(customer.shopId);
      const cartQuantities: Record<number, number> = {};
      customer.cart.forEach(id => {
        cartQuantities[id] = (cartQuantities[id] || 0) + 1;
      });
      const matchedProducts = products.filter(product => cartQuantities[product.id]);
      const enriched = matchedProducts.map(product => ({
        ...product,
        quantity: cartQuantities[product.id],
        total: cartQuantities[product.id] * product.price,
      }));
      setCartItems(enriched);
      setTotalPrice(enriched.reduce((sum, item) => sum + item.total, 0));
    } catch (error) {
      console.error('Error loading cart items:', error);
    }
  };

  const handleConfirmPurchase = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before checking out.');
      return;
    }

    if (
      !firstName ||
      !lastName ||
      !shipping.address ||
      !shipping.city ||
      !shipping.state ||
      !shipping.zip ||
      !cardInfo.cardNumber ||
      !cardInfo.securityCode ||
      !cardInfo.type ||
      !cardInfo.billingAddress ||
      !cardInfo.cardHolder ||
      !cardInfo.expirationDate
    ) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      const shippingAddress = `${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.zip}`;
      const productIds = cartItems.flatMap(item => Array(item.quantity).fill(item.id));
      const transaction = new Transaction(
        0,
        new Date(),
        shippingAddress,
        'PENDING',
        false,
        totalPrice,
        customer.shopId,
        1,
        customer.id,
        productIds
      );

      await createTransaction(transaction);
      await updateCustomerCart(customer.id, []);
      const clearedCustomer = await getCustomerById(customer.id);
      localStorage.setItem("currentUser", JSON.stringify(clearedCustomer));
      setCustomer(clearedCustomer);
      setCartItems([]);
      setTotalPrice(0);

      navigate('/purchase-success');
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('There was a problem completing your purchase.');
    }
  };

  const handleBillingCheckbox = () => {
    setUseShippingAsBilling(!useShippingAsBilling);
    if (!useShippingAsBilling) {
      setCardInfo({
        ...cardInfo,
        billingAddress: `${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.zip}`
      });
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-box">
        <div className="checkout-ribbon"><h2>Checkout</h2></div>
        {transactionMessage && (
          <p style={{ color: 'green', textAlign: 'center', fontWeight: 'bold' }}>{transactionMessage}</p>
        )}

        <div className="section">
          <h3>Customer Information</h3>
          <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
          <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>

        <div className="section">
          <h3>Shipping Information</h3>
          <input type="text" placeholder="Address" value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} />
          <input
            type="text"
            placeholder="City"
            value={shipping.city}
            onChange={e => {
              const value = e.target.value;
              if (/^[^0-9]*$/.test(value)) {
                setShipping({ ...shipping, city: value });
              }
            }}
          />
          <input
            type="text"
            placeholder="State"
            value={shipping.state}
            onChange={e => {
              const value = e.target.value;
              if (/^[^0-9]*$/.test(value)) {
                setShipping({ ...shipping, state: value });
              }
            }}
          />
          <input
            type="text"
            placeholder="ZIP Code"
            value={shipping.zip}
            onChange={e => {
              const zip = e.target.value;
              if (/^\d*$/.test(zip)) {
                setShipping({ ...shipping, zip });
              }
            }}
          />
          <textarea placeholder="Special Delivery Instructions" value={shipping.instructions} onChange={e => setShipping({ ...shipping, instructions: e.target.value })} />
        </div>

        <div className="section">
          <h3>Payment Information</h3>
          <input
            type="text"
            placeholder="Card Number"
            value={cardInfo.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
            className={cardNumberError ? 'error' : ''}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/\s+/g, '');
              if (/^\d*$/.test(rawValue)) {
                setCardInfo({ ...cardInfo, cardNumber: rawValue });
                setCardNumberError('');
              } else {
                setCardNumberError('Card number must contain only numbers');
              }
            }}
          />
          {cardNumberError && <p style={{ color: 'red' }}>{cardNumberError}</p>}

          <input
            type="text"
            placeholder="Security Code"
            value={cardInfo.securityCode}
            onChange={e => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setCardInfo({ ...cardInfo, securityCode: value });
              }
            }}
          />
          <input
            type="password"
            placeholder="PIN (optional)"
            value={cardInfo.pin}
            onChange={e => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setCardInfo({ ...cardInfo, pin: value });
              }
            }}
          />
          <select value={cardInfo.type} onChange={e => setCardInfo({ ...cardInfo, type: e.target.value })}>
            <option value="">Select Card Type</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <input type="checkbox" id="billing-same" checked={useShippingAsBilling} onChange={handleBillingCheckbox} style={{ marginRight: '0.5rem' }} />
            <label htmlFor="billing-same">Use shipping address as billing address</label>
          </div>
          <input type="text" placeholder="Billing Address" value={cardInfo.billingAddress} onChange={e => setCardInfo({ ...cardInfo, billingAddress: e.target.value })} />
          <input type="text" placeholder="Card Holder Name" value={cardInfo.cardHolder} onChange={e => setCardInfo({ ...cardInfo, cardHolder: e.target.value })} />
          <input type="month" placeholder="Expiration Date" id="expiration-date" value={cardInfo.expirationDate} onChange={e => setCardInfo({ ...cardInfo, expirationDate: e.target.value })} />
        </div>

        <button onClick={handleConfirmPurchase}>Confirm Purchase</button>
      </div>
      <div className="checkout-summary">
        <h3>Order Summary</h3>
        <ul>
          {cartItems.map(item => (
            <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
              <span>${item.price.toFixed(2)} x {item.quantity}</span>
            </li>
          ))}
        </ul>
        <p><strong>Total:</strong> ${totalPrice.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default Checkout;
