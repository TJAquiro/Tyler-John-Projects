import Tag from "../types/Tag";
import api from "./apiClient";

/**
 * Creates tag in database using given data.
 * @param data Tag object to create in database
 * @returns Tag object created in database
 */
export const createTag = async (data: Tag) : Promise<Tag> => {
    try {
        const response = await api.post('/tags', data);
        return response.data;
      } catch (error) {
        console.error('Failed to create tag:', error);
        throw error;
      }
}

/**
 * Gets tag from database using a given ID.
 * @param tagId unique number associated with a product
 * @returns Tag object
 */
export const getTagById = async (tagId: number) : Promise<Tag> => {
    try {
        const response = await api.get(`/tags/${tagId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching tag:', error);
        throw error;
    }
};

/**
 * Gets a list of tags from database using a given product ID.
 * @param productId unique number associated with product
 * @returns list of Tag objects
 */
export const getTagsByProductId = async (productId: number): Promise<Tag[]> => {
    try {
        const response = await api.get(`/tags/productId/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching tags by product ID:', error);
        throw error;
    }
};

/**
 * Gets a list of products from database using a given shop ID.
 * @param shopId unique number associated with shop
 * @returns list of Tag objects
 */
export const getTagsByShopId = async (shopId: number): Promise<Tag[]> => {
    try {
        const response = await api.get(`/tags/shopId/${shopId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching tags by shop ID:', error);
        throw error;
    }
};

/**
 * Updates an existing tag in the database. Ignores list fields.
 * @param updatedTag updated Tag object
 * @returns updated Tag object from database
 */
export const updateTag = async (updatedTag: Tag) : Promise<Tag> => {
    try {
        const response = await api.put(`/tags`, updatedTag);
        return response.data;
    } catch (error) {
        console.error('Error updating tag:', error);
        throw error;
    }
};

/**
 * Updates a tag's products.
 * @param tagId id of tag to update
 * @param productIds updated list of product IDs
 * @returns object containing "tagId" (number) and "productIds" (number[])
 */
export const updateTagProducts = async (tagId: number, productIds: number[]) : Promise<{tagId: number, productIds: number[]}> => {
    try {
        const response = await api.put(`/tags/${tagId}/productIds`, {productIds});
        return response.data;
    } catch (error) {
        console.error(`Error updating tag's products:`, error);
        throw error;
    }
}

/**
 * Deletes an existing tag from the database.
 * @param tagId The ID of the tag to delete
 * @returns confirmation string that the tag was deleted
 */
export const deleteTag = async (tagId: number): Promise<string> => {
    try {
        await api.delete(`/tags/${tagId}`);
        return `Tag with ID ${tagId} successfully deleted.`;
    } catch (error) {
        console.error('Error deleting tag:', error);
        throw error;
    }
};