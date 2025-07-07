import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Mousewheel } from "swiper/modules";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";

import { getProducts, handleError } from "./hooks";

import "swiper/css";
import "swiper/css/navigation";
import 'swiper/css/scrollbar';
import "./App.css";
import Spinner from "./Spinner";

const COLORS = [
  { key: "yellow", label: "Yellow Gold", color: "#E6CA97" },
  { key: "rose", label: "Rose Gold", color: "#E1A4A9" },
  { key: "white", label: "White Gold", color: "#D9D9D9" },
];
const defaultColors = {};

function App() {
  const [products, setProducts] = useState([]);
  const [selectedColors, setSelectedColors] = useState({});
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    minPopularity: "",
    maxPopularity: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const prod = await getProducts();
        setProducts(prod);
        prod.forEach((_, index) => (defaultColors[index] = "yellow"));
        setSelectedColors(defaultColors);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleColorClick = (index, color) => {
    setSelectedColors((prev) => ({ ...prev, [index]: color }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilter = async () => {
    const preparedFilters = {};
    if (filters.minPrice) preparedFilters.minPrice = Number(filters.minPrice);
    if (filters.maxPrice) preparedFilters.maxPrice = Number(filters.maxPrice);
    if (filters.minPopularity)
      preparedFilters.minPopularity = Number(filters.minPopularity);
    if (filters.maxPopularity)
      preparedFilters.maxPopularity = Number(filters.maxPopularity);
    setIsLoading(true);
    try {
      const prod = await getProducts(preparedFilters);
      setProducts(prod);
      prod.forEach((_, index) => (defaultColors[index] = "yellow"));
      setSelectedColors(defaultColors);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="main-page">
      <h1 className="page-title">Product List</h1>
      <div className="filter">
        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => handleFilterChange("minPrice", e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Popularity"
          value={filters.minPopularity}
          onChange={(e) => handleFilterChange("minPopularity", e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Popularity"
          value={filters.maxPopularity}
          onChange={(e) => handleFilterChange("maxPopularity", e.target.value)}
        />
        <button onClick={handleFilter}>Filter</button>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <Swiper
          modules={[Navigation, Mousewheel]}
          spaceBetween={10}
          slidesPerView={4}
          navigation
          mousewheel
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 10 },
            480: { slidesPerView: 2, spaceBetween: 10 },
            768: { slidesPerView: 3, spaceBetween: 15 },
            1024: { slidesPerView: 4, spaceBetween: 20 },
          }}
        >
          {products?.map(({ name, price, images, popularityScore }, index) => (
            <SwiperSlide key={name}>
              <div className="product-card">
                <img
                  src={images[selectedColors[index] || "yellow"]}
                  alt="product-image"
                  className="product-image"
                />
                <p className="product-title">{name}</p>
                <p className="product-price">${price.toFixed(2)} USD</p>
                <div className="color-selection">
                  {COLORS.map((color) => (
                    <div
                      className="color"
                      key={color.key}
                      onClick={() => handleColorClick(index, color.key)}
                      style={{
                        background: color.color,
                        boxShadow:
                          selectedColors[index] === color.key &&
                          `0 0 0 2px #fff, 0 0 0 3px #000`,
                      }}
                    />
                  ))}
                </div>
                <p className="color-name">
                  {COLORS.find((c) => c.key === selectedColors[index])?.label}
                </p>
                <span className="rating">
                  <Rating
                    style={{ maxWidth: 120 }}
                    value={popularityScore * 5}
                    readOnly
                    items={5}
                  />{" "}
                  {popularityScore}/1
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </main>
  );
}

export default App;
