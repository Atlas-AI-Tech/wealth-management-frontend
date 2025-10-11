import apiClient from "./apiClient";

export const fetchAllBorrowersFromServer = async () => {
  try {
    const response = await apiClient.get("/customer/");
    return response.data;
  } catch (error) {
    console.error("Error fetching customer data:", error);
    throw error;
  }
};

export const addBorrowerOnServer = async (borrowerDetails) => {
  try {
    const response = await apiClient.post("/customer/", borrowerDetails);
    return response.data;
  } catch (error) {
    console.error(error.response.data.msg);
    throw error;
  }
};

export const fetchDocumentsInsightsFromServer = async (uuid) => {
  try {
    const response = await apiClient.get("/analyze/insight/" + uuid);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer data:", error);
    throw error;
  }
};

export const fetchBureauDataFromServer = async (uuid) => {
  try {
    const response = await apiClient.get(
      "/bureau/customer/" + uuid + "/full_report"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching customer bureau data:", error);
    throw error;
  }
};

export const fetchFraudDataFromServer = async (uuid) => {
  try {
    const response = await apiClient.get(
      "banking/fraud_check/"+ uuid

    );
    return response.data;
  } catch (error) {
    console.error("Error fetching customer bureau data:", error);
    throw error;
  }
};

export const fetchEodBalanceFromServer = async (uuid) => {
  try {
    const response = await apiClient.get("/banking/eod_balances/" + uuid);
    return response.data;
  } catch (error) {
    console.error("Error fetching eod balance data:", error);
    throw error;
  }
};

export const fetchBankingSummaryFromServer = async (uuid) => {
  try {
    const response = await apiClient.get("/banking/summary/" + uuid);
    return response.data;
  } catch (error) {
    console.error("Error fetching banking summary data:", error);
    throw error;
  }
};

export const fetchDirectorDetailsFromServer = async (uuid) => {
  try {
    const api = "/director/customer/" + uuid;
    // const response = await apiClient.get("/financial/customer/" + uuid);
    const response = await apiClient.get(api);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer financial data:", error);
    throw error;
  }
};

export const fetchFinancialDataFromServer = async (uuid) => {
  try {
    const response = await apiClient.get("/financial/customer/" + uuid);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer financial data:", error);
    throw error;
  }
};

export const fetchAllTransactionsFromServer = async (uuid) => {
  try {
    const response = await apiClient.get(
      "/banking/categorised_transactions/" + uuid
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all transactions data:", error);
    throw error;
  }
};
