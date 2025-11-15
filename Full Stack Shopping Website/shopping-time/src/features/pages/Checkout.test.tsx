/**
 * Code generated using AI with edits
 * 
 * Tests for checkout
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Checkout from './Checkout';
import * as productApi from '../../api/productApi';
import * as customerApi from '../../api/customerApi';
import * as transactionApi from '../../api/transactionApi';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import Customer from '../../types/Customer';
import Product from '../../types/Product';
import { createRoot } from 'react-dom/client';
import React from 'react';

vi.mock('../../api/productApi');
vi.mock('../../api/customerApi');
vi.mock('../../api/transactionApi');

const mockProducts: Product[] = [
  { id: 1, name: 'Apple', price: 1.25, imageUrl: '', amountInStock: 10, listed: true, shopId: 1, reviews: [], tagIds: [], description: '' },
  { id: 2, name: 'Banana', price: 1.25, imageUrl: '', amountInStock: 10, listed: true, shopId: 1, reviews: [], tagIds: [], description: '' },
];

const mockCustomer: Customer = {
  id: 1,
  username: 'mockuser',
  firstName: 'Mock',
  lastName: 'User',
  cart: [1, 1, 2],
  shopId: 1,
  cardInfoIds: [],
  discountIds: [],
  transactionIds: [],
};

function mountWithContext(component: React.ReactNode) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(
    <AuthContext.Provider value={{ user: mockCustomer, userType: 'customer', login: vi.fn(), logout: vi.fn() }}>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </AuthContext.Provider>
  );
  return container;
}

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

async function waitForText(container: HTMLElement, text: string, timeout = 1000) {
  const start = Date.now();
  while (!container.innerHTML.includes(text)) {
    if (Date.now() - start > timeout) {
      throw new Error(`Timeout waiting for text: "${text}"`);
    }
    await flushPromises();
  }
}

describe('Checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });

    (productApi.getProductsByShopId as any).mockResolvedValue(mockProducts);
    (customerApi.getCustomerById as any).mockResolvedValue(mockCustomer);
    (transactionApi.createTransaction as any).mockResolvedValue({});
    (customerApi.updateCustomerCart as any).mockResolvedValue({});
  });

  it('displays cart items and total correctly', async () => {
    const container = mountWithContext(<Checkout />);
    await waitForText(container, 'Apple');
    expect(container.innerHTML).toContain('Apple');
    expect(container.innerHTML).toContain('Banana');
    expect(container.innerHTML).toContain('$3.75');
  });

  it('shows error for invalid card number', async () => {
    const container = mountWithContext(<Checkout />);
    await waitForText(container, 'Checkout');

    const input = container.querySelector('input[placeholder="Card Number"]') as HTMLInputElement;
    Object.defineProperty(input, 'value', { value: 'abc', writable: true });
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await flushPromises();

    expect(container.innerHTML).toContain('Card number must contain only numbers');
  });
  it('updates card type when user selects from dropdown', async () => {
    const container = mountWithContext(<Checkout />);
    await waitForText(container, 'Checkout');
  
    const select = container.querySelector('select') as HTMLSelectElement;
    select.value = 'debit';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await flushPromises();
  
    expect(select.value).toBe('debit');
  });
  it('updates expiration date input', async () => {
    const container = mountWithContext(<Checkout />);
    await waitForText(container, 'Checkout');
  
    const monthInput = container.querySelector('input[type="month"]') as HTMLInputElement;
  
    // Simulate React-compatible change
    const event = new Event('input', { bubbles: true });
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!.call(monthInput, '2025-12');
    monthInput.dispatchEvent(event);
  
    await flushPromises();
  
    expect(monthInput.value).toBe('2025-12');
  });
});
