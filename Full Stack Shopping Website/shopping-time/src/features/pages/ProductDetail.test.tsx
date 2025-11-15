/// <reference types="vitest" />
/// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductDetail from './ProductDetail';
import * as productApi from '../../api/productApi';
import * as tagApi from '../../api/tagApi';
import * as customerApi from '../../api/customerApi';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import Customer from '../../types/Customer';
import Product from '../../types/Product';
import Tag from '../../types/Tag';
import { createRoot } from 'react-dom/client';
import React from 'react';

vi.mock('../../api/productApi');
vi.mock('../../api/tagApi');
vi.mock('../../api/customerApi');

// Mock data
const mockProduct: Product = {
  id: 1,
  name: 'Test Product',
  description: 'A test description.',
  price: 19.99,
  amountInStock: 5,
  imageUrl: 'http://example.com/image.jpg',
  listed: true,
  shopId: 1,
  reviews: [],
  tagIds: [],
};

const mockTags: Tag[] = [
  { id: 1, name: 'Sample Tag', imageUrl: 'tag.png', shopId: 1, productIds: [] },
];

const mockCustomer: Customer = {
  id: 1,
  username: 'mockuser',
  firstName: 'Mock',
  lastName: 'User',
  cart: [],
  shopId: 1,
  cardInfoIds: [],
  discountIds: [],
  transactionIds: [],
};

// Helper to mount component
function mountWithContext(component: React.ReactNode) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(
    <AuthContext.Provider
      value={{
        user: mockCustomer,
        userType: 'customer',
        login: vi.fn(),
        logout: vi.fn(),
      }}
    >
      <MemoryRouter initialEntries={['/products/1']}>
        <Routes>
          <Route path="/products/:id" element={component} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
  return container;
}

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

async function waitForElementToDisappear(container: HTMLElement, text: string, timeout = 1000) {
  const start = Date.now();
  while (container.innerHTML.includes(text)) {
    if (Date.now() - start > timeout) throw new Error(`Timeout: '${text}' still visible`);
    await new Promise(res => setTimeout(res, 10));
  }
}

describe('ProductDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    (productApi.getProductById as any).mockResolvedValue(mockProduct);
    (tagApi.getTagsByProductId as any).mockResolvedValue(mockTags);
    (customerApi.getCustomerById as any).mockResolvedValue(mockCustomer);
    (customerApi.updateCustomerCart as any).mockResolvedValue({});
  });

  it('renders product details correctly', async () => {
    const container = mountWithContext(<ProductDetail />);
    await flushPromises();
    await waitForElementToDisappear(container, 'Loading product');

    expect(container.innerHTML).toContain('Test Product');
    expect(container.innerHTML).toContain('$19.99');
    expect(container.innerHTML).toContain('5 available');
    expect(container.innerHTML).toContain('A test description.');
    expect(container.innerHTML).toContain('Sample Tag');
  });

  it('shows error message on product fetch failure', async () => {
    (productApi.getProductById as any).mockRejectedValueOnce(new Error('fail'));
    const container = mountWithContext(<ProductDetail />);
    await flushPromises();
    await waitForElementToDisappear(container, 'Loading product');
    expect(container.innerHTML).toContain('Failed to load product data.');
  });

  it('shows fallback image if product image is relative', async () => {
    (productApi.getProductById as any).mockResolvedValueOnce({ ...mockProduct, imageUrl: 'relative.jpg' });
    const container = mountWithContext(<ProductDetail />);
    await flushPromises();
    await waitForElementToDisappear(container, 'Loading product');
    expect(container.innerHTML).toContain('src="failedToLoad"');
  });

  it('displays "Out of Stock" if amount is 0', async () => {
    (productApi.getProductById as any).mockResolvedValueOnce({ ...mockProduct, amountInStock: 0 });
    const container = mountWithContext(<ProductDetail />);
    await flushPromises();
    await waitForElementToDisappear(container, 'Loading product');
    expect(container.innerHTML).toContain('Out of Stock');
  });

  it('adds item to cart and shows confirmation message', async () => {
    const container = mountWithContext(<ProductDetail />);
    await flushPromises();
    await waitForElementToDisappear(container, 'Loading product');

    const button = container.querySelector('button.add-to-cart');
    if (button instanceof HTMLElement) button.click();

    await flushPromises();
    expect(localStorage.setItem).toHaveBeenCalled();
    expect(container.innerHTML).toContain('Added!');
  });

  it('handles missing customer safely during cart update', async () => {
    (customerApi.getCustomerById as any).mockResolvedValueOnce(mockCustomer);
    const container = mountWithContext(<ProductDetail />);
    await flushPromises();
    await waitForElementToDisappear(container, 'Loading product');

    const button = container.querySelector('button.add-to-cart');
    if (button instanceof HTMLElement) button.click();

    await flushPromises();
    expect(customerApi.updateCustomerCart).toHaveBeenCalled();
  });

  it('does not render tag section if tags are empty', async () => {
    (tagApi.getTagsByProductId as any).mockResolvedValueOnce([]);
    const container = mountWithContext(<ProductDetail />);
    await flushPromises();
    await waitForElementToDisappear(container, 'Loading product');
    expect(container.innerHTML).not.toContain('Tags:');
  });

  it('does not crash if product is null after loading', async () => {
    (productApi.getProductById as any).mockResolvedValueOnce(null);
    const container = mountWithContext(<ProductDetail />);
    await flushPromises();
    await waitForElementToDisappear(container, 'Loading product');
    expect(container.innerHTML).toContain('Failed to load product data.');
  });
});
