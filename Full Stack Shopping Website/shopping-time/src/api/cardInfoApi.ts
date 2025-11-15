import CardInfo from "../types/CardInfo";
import api from "./apiClient";

/**
 * Creates card info in database using given data.
 * @param data CardInfo object to create in database
 * @returns CardInfo object created in database
 */
export const createCardInfo = async (data: CardInfo) : Promise<CardInfo> => {
    try {
        const response = await api.post('/cards', data);
        return response.data;
      } catch (error) {
        console.error('Failed to create card info:', error);
        throw error;
      }
}

/**
 * Gets card info from database using a given ID.
 * @param cardInfoId unique number associated with card info
 * @returns CardInfo object
 */
export const getCardInfoById = async (cardInfoId: number) : Promise<CardInfo> => {
    try {
        const response = await api.get(`/cards/${cardInfoId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching card info:', error);
        throw error;
    }
};

/**
 * Updates existing card information in the database.
 * @param updatedCardInfo updated Card Info object
 * @returns updated Card Info object from database
 */
export const updateCardInfo = async (updatedCardInfo: CardInfo) : Promise<CardInfo> => {
    try {
        const response = await api.put(`/cards`, updatedCardInfo);
        return response.data;
    } catch (error) {
        console.error('Error updating card info:', error);
        throw error;
    }
};

/**
 * Deletes an existing card info from the database.
 * @param card infoId The ID of the card info to delete
 * @returns confirmation string that the card info was deleted
 */
export const deleteCardInfo = async (cardInfoId: number): Promise<string> => {
    try {
        await api.delete(`/cards/${cardInfoId}`);
        return `Card Info with ID ${cardInfoId} successfully deleted.`;
    } catch (error) {
        console.error('Error deleting card info:', error);
        throw error;
    }
};