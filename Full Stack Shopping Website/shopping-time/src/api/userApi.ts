import api from "./apiClient";

/**
 * Checks if a username exists in the database.
 * @param username username to check in database
 * @returns true if username exists, false otherwise
 */
export const usernameExists = async (username: String) : Promise<Boolean> => {
    try {
        const response = await api.get(`/usernameexists/${username}`);
        return response.data["exists"];
      } catch (error) {
        console.error('Failed to check if username exists:', error);
        throw error;
      }
}

/**
 * Checks if a customer's password is valid.
 * @param username customer's username
 * @param password password to check in database
 * @returns object containing a "valid" (boolean) field and an "id" (number) field
 */
export const authenticateCustomer = async (username: String, password: String) : Promise<{valid: boolean, id: number}> => {
  try {
    const response = await api.put(`authenticate/customer/${username}`, password);
    return response.data;
  } catch (error) {
    console.error(`Failed to check if customer's password is valid`, error);
    throw error;
  }
}

/**
 * Checks if a business owner's password is valid.
 * @param username business owner's username
 * @param password password to check in database
 * @returns object containing a "valid" (boolean) field and an "id" (number) field
 */
export const authenticateBusinessOwner = async (username: String, password: String): Promise<{valid: boolean, id: number}> => {
  try {
    const response = await api.put(`authenticate/businessOwner/${username}`, password);
    return response.data;
  } catch (error) {
    console.error(`Failed to check if business owner's password is valid`, error);
    throw error;
  }
}