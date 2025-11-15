import Product from "../types/Product";
import api from "./apiClient";

/**
 * Creates product in database using given data.
 * @param data Product object to create in database
 * @returns Product object created in database
 */
export const createProduct = async (data: Product) : Promise<Product> => {
    try {
        const response = await api.post('/products', data);
        return response.data;
      } catch (error) {
        console.error('Failed to create product:', error);
        throw error;
      }
}

/**
 * Gets product from database using a given ID.
 * @param productId unique number associated with a product
 * @returns Product object
 */
export const getProductById = async (productId: number) : Promise<Product> => {
    try {
        const response = await api.get(`/products/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
};


/**
 * Gets a list of products from database using a given transaction ID.
 * @param transactionId unique number associated with transaction
 * @returns list of Product objects
 */
export const getProductsByTransactionId = async (transactionId: number): Promise<Product[]> => {
    try {
        const response = await api.get(`/products/transactionId/${transactionId}`);
        return response.data; // Assuming response.data is already a number[]
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

/**
 * Gets a list of products from database using a given shop ID.
 * @param shopId unique number associated with shop
 * @returns list of Product objects
 */
export const getProductsByShopId = async (shopId: number): Promise<Product[]> => {
    try {
        const response = await api.get(`/products/shopId/${shopId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

/**
 * Gets a list of products from database using a given list of product IDs.
 * @param productIds list of product IDs
 * @returns list of Product objects
 */
export const getProductsByIdList = async (productIds: number[]): Promise<Product[]> => {
    try {
        const response = await api.put(`/products/getByIdList`, productIds);
        return response.data;
    } catch (error) {
        console.error('Error fetching products by ID list:', error);
        throw error;
    }
};

/**
 * Gets a list of products from database using a given tag ID.
 * @param tagId unique number associated with tag
 * @returns list of Product objects
 */
export const getProductsByTagId = async (tagId: number): Promise<Product[]> => {
    try {
        const response = await api.get(`/products/tagId/${tagId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching products by tag ID:', error);
        throw error;
    }
};

/**
 * Updates an existing product in the database. Ignores list fields.
 * @param updatedProduct updated Product object
 * @returns updated Product object from database
 */
export const updateProduct = async (updatedProduct: Product) : Promise<Product> => {
    try {
        const response = await api.put(`/products`, updatedProduct);
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

/**
 * Updates a product's tags.
 * @param productId id of product to update
 * @param tagIds updated list of tag IDs
 * @returns object containing "productId" (number) and "tagIds" (number[])
 */
export const updateProductTags = async (productId: number, tagIds: number[]) : Promise<{customerId: number, tagIds: number[]}> => {
    try {
        const response = await api.put(`/products/${productId}/tagIds`, {tagIds});
        return response.data;
    } catch (error) {
        console.error(`Error updating product's tags:`, error);
        throw error;
    }
}

/**
 * Updates a product's reviews.
 * @param productId id of product to update
 * @param reviews updated list of reviews
 * @returns object containing "productId" (number) and "reviews" (string[])
 */
export const updateProductReviews = async (productId: number, reviews: string[]) : Promise<{customerId: number, reviews: string[]}> => {
    try {
        const response = await api.put(`/products/${productId}/reviews`, {reviews});
        return response.data;
    } catch (error) {
        console.error(`Error updating product's reviews:`, error);
        throw error;
    }
}

/**
 * Deletes an existing product from the database.
 * @param productId The ID of the product to delete
 * @returns confirmation string that the product was deleted
 */
export const deleteProduct = async (productId: number): Promise<string> => {
    try {
        await api.delete(`/products/${productId}`);
        return `Product with ID ${productId} successfully deleted.`;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};