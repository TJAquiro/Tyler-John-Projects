import api from "./apiClient";

/*
uploadImage was written by ChatGPT
Prompt:

"
How would you complete this function which uploads an image to the aforementioned server using the Axios library? api is an AxiosInstance.

**
 * Attempts to upload the image at imageUrl to the backend.
 * @param imageUrl location of image to be uploaded, relative to ../../public/images
 *
export const uploadImage = async (imageUrl: String) : Promise<void> => {
	try {
		const requestData = ???;
		await api.put(/images/${imageUrl}, requestData);
	  } catch (error) {
		console.error('Image upload failed: ', error);
		throw error;
	  }
}
"

- Hugh
*/

/**
 * Get an list of all existing image files in the backend.
 * @returns a list of filenames
 */
export const getAllImageFilenames = async (): Promise<string[]> => {
	try
	{
		const response = await api.get(`/images/`);
		return response.data;
	}
	catch (error)
	{
		console.error('Couldn\'t get image names: ', error);
		return ["[Failed to retrieve image names]"];
	}
}

/**
 * Attempts to upload the image to the backend at imageUrl.
 * @param imageUrl location uploaded image will be accessible at localhost:3001/api/images/imageUrl
 * @param File image file to upload
 */
export const uploadImage = async (imageUrl: string, file: File): Promise<void> => {
	try
	{
		// Create FormData to send the file
		const formData = new FormData();
		formData.append('image', file); // 'image' should match the field expected on the backend

		// Send the PUT request to upload the image
		await api.put(`/images/${imageUrl}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data', // Automatically set for FormData, but can be manually set
			}
		});
	}
	catch (error) {
		console.error('Image upload failed: ', error);
		throw error;
	}
}

/**
 * Get an image file from the backend given an imageUrl.
 * @param imageUrl location of the desired image in the backend
 * @returns a temporary URL which can be given to the src parameter of an img
 */
export const getImageByUrl = async (imageUrl: string): Promise<string> => {
	try
	{
		const response = await api.get(`/images/${imageUrl}`, {
			responseType: 'arraybuffer'
		});

		const imageBlob = new Blob([response.data]);
		return URL.createObjectURL(imageBlob);
	}
	catch (error)
	{
		console.error('Couldn\'t get image: ', error);
		return "failedToLoad";
	}
}