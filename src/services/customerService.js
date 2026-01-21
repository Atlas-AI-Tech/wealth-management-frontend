import apiClient from "./apiClient";

// Upload transcript/text documents
export const uploadDocumentsToServer = async (user_uuid, file) => {
  try {
    const formData = new FormData();
    formData.append("user_uuid", user_uuid);
    formData.append("file", file);

    const response = await apiClient.post("/upload-text-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};

// Upload audio for transcription + analysis
export const uploadAudioToServer = async (user_uuid, file) => {
  try {
    const formData = new FormData();
    formData.append("user_uuid", user_uuid);
    formData.append("file", file);

    const response = await apiClient.post("/upload-audio-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading audio:", error);
    throw error;
  }
};