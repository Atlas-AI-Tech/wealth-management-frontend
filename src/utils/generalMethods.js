export const convertUnderscoreToCamelCase = (str) => {
  if (!str) return "";

  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const flatFinancialProvisinalData = (data = []) => {
  // First sort by year
  const sortedData = [...data].sort((a, b) => {
    const yearA = parseInt(a.year.split("_")[1]);
    const yearB = parseInt(b.year.split("_")[1]);
    return yearA - yearB;
  });

  return {
    years: sortedData.map((item) => item.year),
    wc_position: sortedData.map((item) => item.wc_position),
    total_current_assets: {
      capital_assets: sortedData.map(
        (item) => item.total_current_assets.capital_assets
      ),
      cash: sortedData.map((item) => item.total_current_assets.cash),
      inventory: sortedData.map((item) => item.total_current_assets.inventory),
      receivables: sortedData.map(
        (item) => item.total_current_assets.receivables
      ),
    },
    total_current_liabilities: {
      creditors: sortedData.map(
        (item) => item.total_current_liabilities.creditors
      ),
      loan_repayments: sortedData.map(
        (item) => item.total_current_liabilities.loan_repayments
      ),
      permits_and_licenses: sortedData.map(
        (item) => item.total_current_liabilities.permits_and_licenses
      ),
      rent: sortedData.map((item) => item.total_current_liabilities.rent),
      salary: sortedData.map((item) => item.total_current_liabilities.salary),
    },
  };
};

// Function to calculate the percentage of each value
export const calculatePercentages = (data) => {
  const total = Object.values(data).reduce((acc, value) => acc + value, 0); // Sum of all values
  const percentages = {};

  // Calculate the percentage for each key
  for (let key in data) {
    const percentage = ((data[key] / total) * 100).toFixed(2); // Calculate percentage and round to 2 decimals
    percentages[key] = percentage;
  }

  return percentages;
};

export const findAllDigitOfString = (string) => {
  const digits = string.match(/\d/g);
  return digits ? Number(digits.slice(0, 2).join("")) : 0;
};

export const getLast4Months = () => {
  const months = [];
  const today = new Date();

  for (let i = 0; i < 4; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    months.push(`${year}-${month}`);
  }

  return months.reverse();
};

export function convertToNumber(value) {
  const numericPart = parseFloat(value);
  const suffix = value.match(/[a-zA-Z]+/);

  if (!suffix) {
    return numericPart;
  }

  switch (suffix[0].toUpperCase()) {
    case "M":
      return numericPart * 1_000_000;
    case "K":
      return numericPart * 1_000;
    case "B":
      return numericPart * 1_000_000_000;
    default:
      return numericPart;
  }
}

export function formatNumberToSuffix(value) {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + " M";
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + " K";
  } else {
    return value.toString();
  }
}

export const decodeJWT = () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    console.error("No token found");
    return null;
  }

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

export const formatDateToShowOnTable = (utcString) => {
  if (!utcString) return { date: "", time: "" };

  const date = new Date(utcString);

  // Convert to IST (Indian Standard Time)
  const istOffset = 330; // IST is UTC +5:30
  const istDate = new Date(date.getTime() + istOffset * 60 * 1000);

  // Format day with suffix
  const day = istDate.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[istDate.getMonth()];
  const year = istDate.getFullYear();

  // Format time
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, "0");

  // Return formatted date and time
  return {
    date: `${day}${suffix} ${month}, ${year}`,
    time: `${formattedHours}:${formattedMinutes} ${period}`,
  };
};

export const isAllTransactionsSearchInputEmpty = (searchInputs) => {
  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    if (typeof value === "string") {
      return value.trim() === "";
    }
    return false;
  }

  for (const key in searchInputs) {
    if (!isEmpty(searchInputs[key])) {
      return false;
    }
  }
  return true;
};
