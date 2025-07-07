const API_TOKEN = import.meta.env.VITE_COLLECT_API_TOKEN;
const API_URL = "https://api.collectapi.com/economy/goldPrice";
const API_JSON_URL = "https://renart-test.onrender.com/products";
const API_OPTIONS = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `${API_TOKEN}`,
  },
};

export const handleError = (message, error) => {
  console.error(`${message}: ${error}`);
  throw error;
};

const convertPrice = async (price) => {
  const API_USD_URL = `https://api.collectapi.com/economy/exchange?int=${price}&to=USD&base=TRY`;
  try {
    const response = await fetch(API_USD_URL, API_OPTIONS);
    if (!response.ok) throw new Error(`HTTP error. Status: ${response.status}`);
    const data = await response.json();
    return data.result.data[0].calculated;
  } catch (error) {
    handleError("Fetching gold price", error);
  }
};

export const getGoldPrice = async () => {
  try {
    const response = await fetch(API_URL, API_OPTIONS);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    const goldPriceTry = data.result.find(
      (price) => price.name === "Gram Altın"
    ).selling;
    const finalPrice = await convertPrice(goldPriceTry);
    return finalPrice;
  } catch (error) {
    handleError("Fetching gold price", error);
  }
};

export const getProducts = async (filters = {}) => {
  try {
    const response = await fetch(API_JSON_URL);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    const goldPrice = await getGoldPrice();
    let updatedData =
      goldPrice &&
      data.map((product) => ({
        ...product,
        price: (product.popularityScore + 1) * product.weight * goldPrice,
      }));
    if (
      filters.minPrice ||
      filters.maxPrice ||
      filters.minPopularity ||
      filters.maxPopularity
    ) {
      updatedData = updatedData.filter((product) => {
        const filteredData =
          (filters.minPrice === undefined ||
            product.price >= filters.minPrice) &&
          (filters.maxPrice === undefined ||
            product.price <= filters.maxPrice) &&
          (filters.minPopularity === undefined ||
            product.popularityScore >= filters.minPopularity) &&
          (filters.maxPopularity === undefined ||
            product.popularityScore <= filters.maxPopularity);
        return filteredData;
      });
    }
    return updatedData;
  } catch (error) {
    handleError("Fetching products", error);
  }
};
