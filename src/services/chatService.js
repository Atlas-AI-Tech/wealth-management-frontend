import apiClient from "./apiClient";


export const fetchChatHistoryFromServer = async () => {
  try {
    const api = `/get-chat-history?user_uuid=d3c92895-27dc-41af-9b1b-b29cdc4d8719`;

    const response = await apiClient.get(api);
    return response.data;
  } catch (error) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.error === "Chat session not found"
    ) {
      console.warn("User has not started a chat session yet.");
      return null;
    } else {
      console.error("Error fetching chat history:", error);
      throw error;
    }
  }
};

export const sendUserQueryToAiModelOnServer = async (messageContent) => {
  try {
    const api = `/chat-with-ai`;
    const response = await apiClient.post(api, {
      query: messageContent,
      user_uuid: "d3c92895-27dc-41af-9b1b-b29cdc4d8719"
    });
    return response.data;
  } catch (error) {
    console.error("Error sending query to AI model:", error);
    throw error;
  }
};


