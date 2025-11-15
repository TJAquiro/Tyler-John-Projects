import Shop from "../types/Shop";
import api from "./apiClient";

/**
 * Creates shop in database using given data.
 * @param data Shop object to create in database
 * @returns Shop object created in database
 */
export const createShop = async (data: Shop) : Promise<Shop> => {
    try {
        const response = await api.post('/shops', data);
        return response.data;
      } catch (error) {
        console.error('Failed to create shop:', error);
        throw error;
      }
}

/**
 * Gets shop from database using a given ID.
 * @param shopId unique number associated with shop
 * @returns Shop object
 */
export const getShopById = async (shopId: number) : Promise<Shop> => {
    try {
        const response = await api.get(`/shops/${shopId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching shop:', error);
        throw error;
    }
};

/**
 * Updates an existing shop in the database. Ignores list fields.
 * @param updatedShop updated Shop object
 * @returns updated Shop object from database
 */
export const updateShop = async (updatedShop: Shop) : Promise<Shop> => {
    try {
        const response = await api.put(`/shops`, updatedShop);
        return response.data;
    } catch (error) {
        console.error('Error updating shop:', error);
        throw error;
    }
};

/**
 * Deletes an existing shop from the database.
 * @param shopId The ID of the shop to delete
 * @returns confirmation string that the shop was deleted
 */
export const deleteShop = async (shopId: number): Promise<string> => {
    try {
        await api.delete(`/shops/${shopId}`);
        return `Shop with ID ${shopId} successfully deleted.`;
    } catch (error) {
        console.error('Error deleting shop:', error);
        throw error;
    }
};