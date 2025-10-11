import apiClient from "./apiClient";

export const uploadDocumentsToServer = async(user_uuid, file)=>{
    try {
        // Create FormData object
        const formData = new FormData();
        
        // Add user_uuid and file to form data
        formData.append('user_uuid', user_uuid);
        formData.append('file', file);
        
        // Make the API request
        const response = await apiClient.post("/upload-file", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        
        // Return the response data
        return response.data;
    } catch (error) {
        console.error('Error uploading document:', error);
        throw error;
    }
}