import { describe, it, expect, beforeEach } from 'vitest';
import purchaseData from './purchases';

describe('purchaseData module', () => {
  // Mock localStorage before each test
  beforeEach(() => {
    // Clear the localStorage
    localStorage.clear();
  });

  // Test addItem method
  it('should add an item to purchaseItems and localStorage', () => {
    const item = {
      itemname: 'Item 1',
      price: 19.99,
      image: 'https://example.com/item1.jpg',
    };

    purchaseData.addItem(item);

    // Check if the item was added to the purchaseItems
    const purchases = purchaseData.getPurchases();
    expect(purchases.length).toBe(1);
    expect(purchases[0]).toEqual(item);

    // Check if the item is stored in localStorage
    const localStorageItem = JSON.parse(localStorage.getItem('purchaseItems') || '[]');
    expect(localStorageItem.length).toBe(1);
    expect(localStorageItem[0]).toEqual(item);
  });

  // Test getPurchases method
  it('should return the correct purchases from localStorage', () => {
    const item1 = {
      itemname: 'Item 1',
      price: 19.99,
      image: 'https://example.com/item1.jpg',
    };
    const item2 = {
      itemname: 'Item 2',
      price: 29.99,
      image: 'https://example.com/item2.jpg',
    };

    // Add items to purchaseData (which saves to localStorage)
    purchaseData.addItem(item1);
    purchaseData.addItem(item2);

    // Check if getPurchases returns the correct items
    const purchases = purchaseData.getPurchases();
    expect(purchases).toHaveLength(2);
    expect(purchases[0]).toEqual(item1);
    expect(purchases[1]).toEqual(item2);
  });

  // Test removeItem method
  it('should remove an item from purchaseItems and localStorage', () => {
    const item1 = {
      itemname: 'Item 1',
      price: 19.99,
      image: 'https://example.com/item1.jpg',
    };
    const item2 = {
      itemname: 'Item 2',
      price: 29.99,
      image: 'https://example.com/item2.jpg',
    };

    // Add items to purchaseData
    purchaseData.addItem(item1);
    purchaseData.addItem(item2);

    // Remove the first item
    purchaseData.removeItem(0);

    // Check if the first item was removed
    const purchases = purchaseData.getPurchases();
    expect(purchases).toHaveLength(1);
    expect(purchases[0]).toEqual(item2);

    // Check if localStorage is updated correctly
    const localStorageItems = JSON.parse(localStorage.getItem('purchaseItems') || '[]');
    expect(localStorageItems).toHaveLength(1);
    expect(localStorageItems[0]).toEqual(item2);
  });
});
