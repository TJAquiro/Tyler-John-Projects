import Customer from "../types/Customer";
import Product from "../types/Product";

// Mock function to simulate fetching product by ID (Replace this with actual backend call)
const getProductById = (id: number): Product | null => {
    const mockProducts: Product[] = [
        { id: 1, name: "Product A", price: 10, amountInStock: 50, imageUrl: "", reviews: [], listed: true, shopId: 1, description: "", tagIds: []},
        { id: 2, name: "Product B", price: 20, amountInStock: 30, imageUrl: "", reviews: [], listed: true, shopId: 1, description: "", tagIds: []},
        { id: 3, name: "Product C", price: 15, amountInStock: 40, imageUrl: "", reviews: [], listed: true, shopId: 1, description: "", tagIds: []},
        { id: 4, name: "Product D", price: 25, amountInStock: 20, imageUrl: "", reviews: [], listed: true, shopId: 2, description: "", tagIds: []},
        { id: 5, name: "Product E", price: 50, amountInStock: 10, imageUrl: "", reviews: [], listed: true, shopId: 2, description: "", tagIds: []},
    ];
    return mockProducts.find(p => p.id === id) || null;
};

export function getCartCost(customer: Customer): number {
    if (!customer || !Array.isArray(customer.cart) || customer.cart.length === 0) return 0; // Return 0 if cart is empty

    let totalCost = 0;
    for (const productId of customer.cart) {
        const product = getProductById(productId);
        if (product) {
            totalCost += product.price;
        } else {
            console.warn(`Product with ID ${productId} not found.`);
        }
    }

    return totalCost;
}