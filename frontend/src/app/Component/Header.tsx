"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Clock,
  Truck,
  User,
  ShoppingCart,
  Search,
  Loader2,
  Tag,
} from "lucide-react";
import debounce from "lodash.debounce";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.peachflask.com";

const Header = () => {
  const router = useRouter();
  const texts = [
    "Minimum Order Amount Rs 3,000",
    "Free Shipping on Orders Above Rs 5,000",
  ];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [searchResults, setSearchResults] = useState({
    suggestions: [],
    products: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);

  const handleNext = () => {
    setDirection(1);
    setIndex((prevIndex) => (prevIndex + 1) % texts.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prevIndex) => (prevIndex - 1 + texts.length) % texts.length);
  };

  // Fetch all products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/products`, {
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch products");
        }

        setAllProducts(data.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get the lowest price from price options
  const getLowestPrice = useCallback((priceOptions) => {
    if (!priceOptions || priceOptions.length === 0) return null;

    // Find the lowest price option
    return priceOptions.reduce((lowest, option) => {
      const currentPrice =
        option.salePrice !== null ? option.salePrice : option.price;
      if (lowest === null || currentPrice < lowest) {
        return currentPrice;
      }
      return lowest;
    }, null);
  }, []);

  // Filter products based on search query
  const filterProducts = useCallback(
    (query) => {
      if (!query || query.length < 2) {
        setSearchResults({
          suggestions: [],
          products: [],
        });
        return;
      }

      const lowerCaseQuery = query.toLowerCase();

      // Filter products that match the query
      const filteredProducts = allProducts
        .filter(
          (product) =>
            product.name.toLowerCase().includes(lowerCaseQuery) ||
            (product.description &&
              product.description.toLowerCase().includes(lowerCaseQuery))
        )
        .slice(0, 5); // Limit to 5 products for better UX

      // Generate search suggestions based on product names and categories
      const uniqueTerms = new Set();

      // Add the query itself as the first suggestion
      uniqueTerms.add(lowerCaseQuery);

      // Add product names that match the query
      allProducts.forEach((product) => {
        const name = product.name.toLowerCase();
        if (name.includes(lowerCaseQuery) && name !== lowerCaseQuery) {
          uniqueTerms.add(name);
        }

        // Add categories if they exist and match
        if (product.categories && product.categories.length > 0) {
          product.categories.forEach((category) => {
            if (typeof category === "string") {
              if (category.toLowerCase().includes(lowerCaseQuery)) {
                uniqueTerms.add(category.toLowerCase());
              }
            } else if (
              category.name &&
              category.name.toLowerCase().includes(lowerCaseQuery)
            ) {
              uniqueTerms.add(category.name.toLowerCase());
            }
          });
        }
      });

      // Convert to array and limit to 5 suggestions
      const suggestions = Array.from(uniqueTerms).slice(0, 5);

      setSearchResults({
        suggestions,
        products: filteredProducts,
      });
    },
    [allProducts]
  );

  // Debounce the search to avoid excessive filtering
  const debouncedSearch = useCallback(
    debounce((query) => {
      filterProducts(query);
    }, 300),
    [filterProducts]
  );

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Add this useEffect to handle clicks outside the search results
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuVariants = {
    closed: {
      x: "-100%",
      transition: {
        type: "tween",
        duration: 0.3,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "tween",
        duration: 0.3,
      },
    },
  };

  const navLinks = [
    { name: "Categories", href: "/categories", hasChildren: false },
    { name: "Our Products", href: "/products" },
    { name: "Reviews", href: "/reviews" },
    { name: "About us", href: "/user/about" },
    { name: "Contact Us", href: "/contact" },
  ];

  // Handle search input
  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      setShowResults(true);
      debouncedSearch(query);
    } else {
      setShowResults(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    filterProducts(suggestion);
    setShowResults(true);
  };

  // Format price to include currency
  const formatPrice = (price) => {
    if (price === null || price === undefined) return "Price not available";
    return `Rs.${Number.parseFloat(price).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get product image URL
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0 && product.images[0].url) {
      return product.images[0].url;
    }
    return "/placeholder.svg?height=100&width=100";
  };

  // Check if product is on sale
  const isOnSale = (product) => {
    if (product.sale && product.sale > 0) return true;

    if (product.priceOptions && product.priceOptions.length > 0) {
      return product.priceOptions.some((option) => option.salePrice !== null);
    }

    return false;
  };

  // Get product price display
  const getProductPriceDisplay = (product) => {
    if (!product.priceOptions || product.priceOptions.length === 0) {
      return formatPrice(0);
    }

    // Find the lowest price option
    const lowestPrice = getLowestPrice(product.priceOptions);

    // Check if any price option is on sale or if there's a global sale
    if (isOnSale(product)) {
      return (
        <div className="flex flex-col">
          <span className="font-medium text-red-600">
            {formatPrice(lowestPrice)}
          </span>
          <span className="text-xs text-gray-500 line-through">
            {formatPrice(product.priceOptions[0].price)}
          </span>
        </div>
      );
    }

    return formatPrice(lowestPrice);
  };

  // Get product weight display
  const getProductWeightDisplay = (product) => {
    if (!product.priceOptions || product.priceOptions.length === 0) {
      return "";
    }

    // Get the first price option for display
    const firstOption = product.priceOptions[0];

    if (firstOption.type === "packet") {
      return `${firstOption.weight}g packet`;
    } else {
      return `${firstOption.weight}g`;
    }
  };

  // Handle product click with programmatic navigation
  const handleProductClick = (productId) => {
    console.log(`Navigating to product: ${productId}`);
    setShowResults(false);
    // Use window.location for direct navigation
    window.location.href = `/product/${productId}`;
  };

  // Render a product item
  const renderProductItem = (product) => {
    return (
      <button
        key={product._id}
        onClick={() => handleProductClick(product._id)}
        className="w-full text-left flex items-center p-2 hover:bg-gray-100 cursor-pointer border-0 bg-transparent"
        style={{ pointerEvents: "auto" }}
      >
        <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
          <img
            src={getProductImage(product) || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-3 flex-1">
          <div className="font-medium">
            {typeof getProductPriceDisplay(product) === "string"
              ? getProductPriceDisplay(product)
              : getProductPriceDisplay(product)}
          </div>
          <div className="text-sm text-gray-700 flex justify-between">
            <span>{product.name}</span>
            {product.priceOptions && product.priceOptions.length > 0 && (
              <span className="text-xs text-gray-500 ml-2">
                {getProductWeightDisplay(product)}
              </span>
            )}
          </div>
          {isOnSale(product) && (
            <div className="flex items-center mt-1">
              <Tag className="h-3 w-3 text-red-600 mr-1" />
              <span className="text-xs text-red-600">On Sale</span>
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <header className="w-full">
      {/* Top announcement bar */}
      <div className="bg-black text-white py-3 px-4 flex items-center justify-between overflow-hidden relative w-full h-10">
        <ChevronLeft className="h-5 w-5 cursor-pointer" onClick={handlePrev} />
        <div className="w-full flex justify-center overflow-hidden relative h-full">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.p
              key={index}
              initial={{ x: direction === 1 ? "100%" : "-100%", opacity: 0 }}
              animate={{ x: "0%", opacity: 1 }}
              exit={{ x: direction === 1 ? "-100%" : "100%", opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center text-sm font-medium absolute w-full flex justify-center items-center"
            >
              {texts[index]}
            </motion.p>
          </AnimatePresence>
        </div>
        <ChevronRight className="h-5 w-5 cursor-pointer" onClick={handleNext} />
      </div>

      {/* Main header */}
      <div className="bg-white py-4 px-4 lg:py-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              className="lg:hidden text-black"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="ms-4 text-3xl font-bold tracking-tighter me-4"
            >
              MS Foods
            </Link>

            {/* Search bar */}
            <div
              className="hidden lg:flex relative flex-1 max-w-xl mx-8"
              ref={searchRef}
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  placeholder="Search for..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />

                {/* Search results dropdown */}
                {showResults && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-[100] border overflow-hidden"
                    style={{ pointerEvents: "auto" }}
                  >
                    {/* Loading indicator */}
                    {isLoading && (
                      <div className="flex justify-center items-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                      </div>
                    )}

                    {/* Error message */}
                    {error && (
                      <div className="p-4 text-red-500 text-center">
                        {error}
                      </div>
                    )}

                    {/* No results message */}
                    {!isLoading &&
                      !error &&
                      searchResults.suggestions.length === 0 &&
                      searchResults.products.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                          No results found for "{searchQuery}"
                        </div>
                      )}

                    {/* Search suggestions */}
                    {!isLoading && searchResults.suggestions.length > 0 && (
                      <div className="p-2 border-b">
                        {searchResults.suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Product results */}
                    {!isLoading && searchResults.products.length > 0 && (
                      <div className="p-2">
                        <div className="px-3 py-2 font-medium">Products</div>
                        {searchResults.products.map(renderProductItem)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile search bar */}
            <div className="flex-1 lg:hidden"></div>

            {/* Account and cart buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="flex items-center space-x-2 px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <User className="h-5 w-5" />
                <span>Account</span>
              </Link>
              <Link
                href="/cart"
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Rs.000 (0)</span>
              </Link>
            </div>

            {/* Mobile cart icon */}
            <Link href="/cart" className="lg:hidden">
              <ShoppingCart className="h-6 w-6" />
            </Link>
          </div>

          {/* Info bar - desktop */}
          <div className="hidden lg:flex items-center justify-between mt-6 space-x-12 border-t">
            {/* Desktop navigation */}
            <div className="hidden lg:block">
              <div className="max-w-7xl mx-auto px-8">
                <nav className="flex items-center space-x-8 py-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-black hover:text-gray-600 transition-colors flex items-center"
                    >
                      {link.name}
                      {link.hasChildren && (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
            <div className="flex items-center space-x-2 gap-5">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Minimum Order Amount</p>
                  <p className="text-sm font-bold">Rs 3,000</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Delivery Timings</p>
                  <p className="text-sm font-bold">10am to 6pm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search bar - below navbar */}
      <div className="lg:hidden px-4 py-2 bg-white border-b">
        <div className="relative w-full" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInput}
            placeholder="Search for..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />

          {/* Search results dropdown for mobile */}
          {showResults && (
            <div
              className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-[100] border overflow-hidden"
              style={{ pointerEvents: "auto" }}
            >
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-center items-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="p-4 text-red-500 text-center">{error}</div>
              )}

              {/* No results message */}
              {!isLoading &&
                !error &&
                searchResults.suggestions.length === 0 &&
                searchResults.products.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                )}

              {/* Search suggestions */}
              {!isLoading && searchResults.suggestions.length > 0 && (
                <div className="p-2 border-b">
                  {searchResults.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}

              {/* Product results */}
              {!isLoading && searchResults.products.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 font-medium">Products</div>
                  {searchResults.products.map(renderProductItem)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Info bar - mobile */}
      <div className="lg:hidden bg-gray-50 py-3 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Truck className="h-5 w-5" />
          <div>
            <p className="text-xs font-medium">Minimum Order Amount</p>
            <p className="text-sm font-bold">Rs 3,000</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <div>
            <p className="text-xs font-medium">Delivery Timings</p>
            <p className="text-sm font-bold">10am to 6pm</p>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 bg-white z-50 overflow-y-auto lg:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-medium">Menu</h2>
              <button
                onClick={toggleMenu}
                className="text-black"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <div>
                    <p className="text-xs font-medium">Minimum Order Amount</p>
                    <p className="text-sm font-bold">Rs 3,000</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <div>
                    <p className="text-xs font-medium">Delivery Timings</p>
                    <p className="text-sm font-bold">10am to 6pm</p>
                  </div>
                </div>
              </div>
            </div>

            <nav className="p-0">
              {navLinks.map((link, index) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center justify-between p-4 border-b text-black hover:bg-gray-50 transition-colors"
                >
                  <span>{link.name}</span>
                  {link.hasChildren && <ChevronRight className="h-5 w-5" />}
                </Link>
              ))}
              <Link
                href="/account"
                className="flex items-center p-4 border-b text-black hover:bg-gray-50 transition-colors"
              >
                <User className="h-5 w-5 mr-2" />
                <span>Account</span>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
