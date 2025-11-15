import { describe, test, expect } from 'vitest';
import { getCartCost } from './customerService'; 
import Customer from '../types/Customer';

describe('getCartCost', () => {
  test('small cart test', () => {
    const customer = new Customer(-1, "", "", "", -1);
    customer.cart = [1, 2, 3];

    const totalCost = getCartCost(customer);
    expect(totalCost).toBe(45); // 10 + 20 + 15
  });

  test('should return 0 for an empty cart', () => {
    const customer = new Customer(-1, "", "", "", -1);
    customer.cart = [];

    const totalCost = getCartCost(customer);
    expect(totalCost).toBe(0);
  });

  test('check how function handles non-existent product IDS', () => {
    const customer = new Customer(-1, "", "", "", -1);
    customer.cart = [1, 2, 99];

    const totalCost = getCartCost(customer);
    expect(totalCost).toBe(30); // 10 + 20 + 0
  });

  test('ensure function can handle two products with same ID in cart', () => {
    const customer = new Customer(-1, "", "", "", -1);
    customer.cart = [1, 1, 2, 3];

    const totalCost = getCartCost(customer);
    expect(totalCost).toBe(55); // (10 + 10) + 20 + 15
  });

  test('should return 0 if customer object is null', () => {
    const totalCost = getCartCost(null as unknown as Customer);
    expect(totalCost).toBe(0);
  });

  test('should return 0 if customer.cart is not an array', () => {
    const customer = new Customer(-1, "", "", "", -1);
    (customer.cart as unknown) = null;

    const totalCost = getCartCost(customer);
    expect(totalCost).toBe(0);
  });

  test('large cart test', () => {
    const customer = new Customer(-1, "", "", "", -1);
    customer.cart = [1, 2, 3, 4, 5];

    const totalCost = getCartCost(customer);
    expect(totalCost).toBe(120); // 10 + 20 + 15 + 25 + 50
  });


  test('if all ids in cart are not valid', () => {
    const customer = new Customer(-1, "", "", "", -1);
    customer.cart = [99, 100, 101];

    const totalCost = getCartCost(customer);
    expect(totalCost).toBe(0);
  });

  test('handle a cart with a mix of valid and invalid product IDs', () => {
    const customer = new Customer(-1, "", "", "", -1);
    customer.cart = [1, 2, 3, 99, 100];

    const totalCost = getCartCost(customer);
    expect(totalCost).toBe(45); // 10 + 20 + 15 + 0 + 0
  });

  test('handle a cart with one valid product', () => {
    const customer = new Customer(-1, "", "", "", -1);
    customer.cart = [3];

    const totalCost = getCartCost(customer);
    expect(totalCost).toBe(15);
  });

  test('cart with only one invalid product', () => {
    const customer = new Customer(-1, "", "", "", -1);
    customer.cart = [99];

    const totalCost = getCartCost(customer);
    expect(totalCost).toBe(0);
  });

  test('handle negative product IDs', () => {
    const customer = new Customer(-1, "", "", "", -1);
    customer.cart = [1, -2, 3];

    const totalCost = getCartCost(customer);
    expect(totalCost).toBe(25); // 10 + 15 (ignoring -2)
  });

  test('handle null or undefined product IDs in the cart', () => {
    const customer = new Customer(-1, "", "", "", -1);
    customer.cart = [1, null as unknown as number, 3, undefined as unknown as number];

    const totalCost = getCartCost(customer);
    expect(totalCost).toBe(25); // 10 + 15 (ignoring null/undefined)
  });

  test('handle extremely large product IDs that don’t exist', () => {
    const customer = new Customer(-1, "", "", "", -1);
    customer.cart = [1, 2, 999999];

    const totalCost = getCartCost(customer);
    expect(totalCost).toBe(30); // 10 + 20 + 0 (for 999999)
  });


  test('should handle a cart with mixed valid, invalid, and duplicate IDs', () => {
    const customer = new Customer(-1, "", "", "", -1);
    customer.cart = [1, 1, 3, 99, 2, 2, 100];

    const totalCost = getCartCost(customer);
    expect(totalCost).toBe(75); // (10 + 10) + 15 + 0 + (20 + 20) + 0
  });
});
