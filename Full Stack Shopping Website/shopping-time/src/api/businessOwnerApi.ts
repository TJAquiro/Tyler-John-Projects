import BusinessOwner from '../types/BusinessOwner.ts';
import api from './apiClient.ts';

/**
 * Creates business owner in database using given data.
 * @param data BusinessOwner object to create in database
 * @returns BusinessOwner object created in database
 */
export const createBusinessOwner = async (data: BusinessOwner) : Promise<BusinessOwner> => {
    try {
        const response = await api.post('/businessOwners', data);
        return response.data;
      } catch (error) {
        console.error('Failed to create business owner:', error);
        throw error;
      }
}

/**
 * Gets business owner from database using a given ID.
 * @param customerId unique number associated with business owner
 * @returns Business Owner object
 */
export const getBusinessOwnerById = async (businessOwnerId: number) : Promise<BusinessOwner> => {
    try {
        const response = await api.get(`/businessOwners/${businessOwnerId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching business owner:', error);
        throw error;
    }
};

/**
 * Gets business owner from database using a given username.
 * @param username unique username associated with business owner
 * @returns Business Owner object
 */
export const getBusinessOwnerByUsername = async (username: string) : Promise<BusinessOwner> => {
    try {
        const response = await api.get(`/businessOwners/getByUsername/${username}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching business owner by username:', error);
        throw error;
    }
};

/**
 * Updates an existing business owner in the database.
 * @param updatedBusinessOwner updated BusinessOwner object
 * @returns updated BusinessOwner object from database
 */
export const updateBusinessOwner = async (updatedBusinessOwner: BusinessOwner) : Promise<BusinessOwner> => {
    try {
        const response = await api.put(`/businessOwners`, updatedBusinessOwner);
        return response.data;
    } catch (error) {
        console.error('Error updating business owner:', error);
        throw error;
    }
};

/**
 * Deletes an existing business owner from the database.
 * @param businessOwnerId The ID of the business owner to delete
 * @returns confirmation string that the business owner was deleted
 */
export const deleteBusinessOwner = async (businessOwnerId: number): Promise<string> => {
    try {
        await api.delete(`/businessOwners/${businessOwnerId}`);
        return `Business owner with ID ${businessOwnerId} successfully deleted.`;
    } catch (error) {
        console.error('Error deleting business owner:', error);
        throw error;
    }
};