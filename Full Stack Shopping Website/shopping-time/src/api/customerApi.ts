import Customer from "../types/Customer";
import api from "./apiClient";

/**
 * Creates customer in database using given data.
 * @param data Customer object to create in database
 * @returns Customer object created in database
 */
export const createCustomer = async (data: Customer) : Promise<Customer> => {
    try {
        const response = await api.post('/customers', data);
        return response.data;
      } catch (error) {
        console.error('Failed to create customer:', error);
        throw error;
      }
}

/**
 * Gets customer from database using a given ID.
 * @param customerId unique number associated with customer
 * @returns Customer object
 */
export const getCustomerById = async (customerId: number) : Promise<Customer> => {
    try {
        const response = await api.get(`/customers/${customerId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching customer by ID:', error);
        throw error;
    }
};

/**
 * Gets customer from database using a given username.
 * @param username unique username associated with customer
 * @returns Customer object
 */
export const getCustomerByUsername = async (username: string) : Promise<Customer> => {
    try {
        const response = await api.get(`/customers/getByUsername/${username}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching customer by username:', error);
        throw error;
    }
};

/**
 * Gets a list of transactions from database using a given shop ID.
 * @param shopId unique number associated with shop
 * @returns list of Customer objects
 */
export const getCustomersByShopId = async (shopId: number) : Promise<Customer[]> => {
    try {
        const response = await api.get(`/customers/shopId/${shopId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching customers by shop ID:', error);
        throw error;
    }
};

/**
 * Updates an existing customer in the database. Ignores list fields.
 * @param updatedCustomer updated Customer object
 * @returns updated Customer object from database
 */
export const updateCustomer = async (updatedCustomer: Customer) : Promise<Customer> => {
    try {
        const response = await api.put(`/customers`, updatedCustomer);
        return response.data;
    } catch (error) {
        console.error('Error updating customer:', error);
        throw error;
    }
};

/**
 * Updates a customer's cart.
 * @param customerId id of customer to update
 * @param updatedCart updated list of product IDs in the cart
 * @returns object containing "customerId" (number) and "productIds" (number[])
 */
export const updateCustomerCart = async (customerId: number, productIds: number[]) : Promise<{customerId: number, productIds: number[]}> => {
    try {
        const response = await api.put(`/customers/${customerId}/cart`, {productIds});
        return response.data;
    } catch (error) {
        console.error(`Error updating customer's cart:`, error);
        throw error;
    }
}

/**
 * Updates a customer's cards.
 * @param customerId id of customer to update
 * @param cardInfoIds updated list of card info IDs in the cart
 * @returns object containing "customerId" (number) and "cardInfoIds" (number[])
 */
export const updateCustomerCards = async (customerId: number, cardInfoIds: number[]) : Promise<{customerId: number, cardInfoIds: number[]}> => {
    try {
        const response = await api.put(`/customers/${customerId}/cardInfoIds`, {cardInfoIds});
        return response.data;
    } catch (error) {
        console.error(`Error updating customer's cards:`, error);
        throw error;
    }
}

/**
 * Updates a customer's discounts.
 * @param customerId id of customer to update
 * @param discountIds updated list of card info IDs in the cart
 * @returns object containing "customerId" (number) and "cardInfoIds" (number[])
 */
export const updateCustomerDiscounts = async (customerId: number, discountIds: number[]) : Promise<{customerId: number, discountIds: number[]}> => {
    try {
        const response = await api.put(`/customers/${customerId}/discountIds`, {discountIds});
        return response.data;
    } catch (error) {
        console.error(`Error updating customer's discounts:`, error);
        throw error;
    }
}

/**
 * Deletes an existing customer from the database.
 * @param customerId The ID of the customer to delete
 * @returns confirmation string that the customer was deleted
 */
export const deleteCustomer = async (customerId: number): Promise<string> => {
    try {
        await api.delete(`/customers/${customerId}`);
        return `Customer with ID ${customerId} successfully deleted.`;
    } catch (error) {
        console.error('Error deleting customer:', error);
        throw error;
    }
};

