import Discount from "../types/Discount";
import api from "./apiClient";

/**
 * Creates discount in database using given data.
 * @param data Discount object to create in database
 * @returns Discount object created in database
 */
export const createDiscount = async (data: Discount) : Promise<Discount> => {
    try {
        const response = await api.post('/discounts', data);
        return response.data;
      } catch (error) {
        console.error('Failed to create discount:', error);
        throw error;
      }
}

/**
 * Gets discount from database using a given ID.
 * @param discountId unique number associated with discount
 * @returns Discount object
 */
export const getDiscountById = async (discountId: number) : Promise<Discount> => {
    try {
        const response = await api.get(`/discounts/${discountId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching discount:', error);
        throw error;
    }
};

/**
 * Updates an existing discount in the database. Ignores list fields.
 * @param updatedDiscount updated Discount object
 * @returns updated Discount object from database
 */
export const updateDiscount = async (updatedDiscount: Discount) : Promise<Discount> => {
    try {
        const response = await api.put(`/discounts`, updatedDiscount);
        return response.data;
    } catch (error) {
        console.error('Error updating discount:', error);
        throw error;
    }
};

/**
 * Updates a discount's tags.
 * @param discountIds id of discount to update
 * @param productIds updated list of product IDs
 * @returns object containing "discountId" (number) and "productIds" (number[])
 */
export const updateDiscountProducts = async (discountId: number, productIds: number[]) : Promise<{discountId: number, productIds: number[]}> => {
    try {
        const response = await api.put(`/discounts/${discountId}/productIds`, {productIds});
        return response.data;
    } catch (error) {
        console.error(`Error updating discount's products:`, error);
        throw error;
    }
}

/**
 * Deletes an existing discount from the database.
 * @param discountId The ID of the discount to delete
 * @returns confirmation string that the discount was deleted
 */
export const deleteDiscount = async (discountId: number): Promise<string> => {
    try {
        await api.delete(`/discounts/${discountId}`);
        return `Discount with ID ${discountId} successfully deleted.`;
    } catch (error) {
        console.error('Error deleting discount:', error);
        throw error;
    }
};