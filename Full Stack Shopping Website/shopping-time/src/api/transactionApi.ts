import Transaction from "../types/Transaction";
import api from "./apiClient";

/**
 * Creates transaction in database using given data.
 * @param data Transaction object to create in database
 * @returns Transaction object created in database
 */
export const createTransaction = async (data: Transaction) : Promise<Transaction> => {
    try {
        const response = await api.post('/transactions', data);
        return response.data;
      } catch (error) {
        console.error('Failed to create transaction:', error);
        throw error;
      }
}

/**
 * Gets transaction from database using a given ID.
 * @param transactionId unique number associated with transaction
 * @returns Transaction object from database
 */
export const getTransactionById = async (transactionId: number) : Promise<Transaction> => {
    try {
        const response = await api.get(`/transactions/${transactionId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching transaction:', error);
        throw error;
    }
};

/**
 * Gets a list of transactions from database using a given product ID.
 * @param productId unique number associated with product
 * @returns list of Transaction objects
 */
export const getTransactionsByProductId = async (productId: number) : Promise<Transaction[]> => {
    try {
        const response = await api.get(`/transactions/productId/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching transactions by product ID:', error);
        throw error;
    }
};

/**
 * Gets a list of transactions from database using a given shop ID.
 * @param shopId unique number associated with shop
 * @returns list of Transaction objects
 */
export const getTransactionsByShopId = async (shopId: number) : Promise<Transaction[]> => {
    try {
        const response = await api.get(`/transactions/shopId/${shopId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching transactions by shop ID:', error);
        throw error;
    }
};

/**
 * Gets a list of transactions from database using a given customer ID.
 * @param customerId unique number associated with customer
 * @returns list of Transaction objects
 */
export const getTransactionsByCustomerId = async (customerId: number) : Promise<Transaction[]> => {
    try {
        const response = await api.get(`/transactions/customerId/${customerId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching transactions by customer ID:', error);
        throw error;
    }
};

/**
 * Updates an existing transaction in the database. Ignores list fields.
 * @param updatedTransaction updated Transaction object
 * @returns updated Transaction object from database
 */
export const updateTransaction = async (updatedTransaction: Transaction) : Promise<Transaction> => {
      try {
          const response = await api.put(`/transactions`, updatedTransaction);
          return response.data;
      } catch (error) {
          console.error('Error updating transaction:', error);
          throw error;
      }
  };

/**
 * Deletes an existing transaction from the database.
 * @param transactionId ID of the transaction to delete
 * @returns confirmation string that the transaction was deleted
 */
export const deleteTransaction = async (transactionId: number): Promise<string> => {
    try {
        await api.delete(`/transactions/${transactionId}`);
        return `Transaction with ID ${transactionId} successfully deleted.`;
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
};