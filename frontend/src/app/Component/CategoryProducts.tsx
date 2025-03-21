"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { ChevronDown, X, Filter } from "lucide-react"
import { useParams } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.peachflask.com"

interface PriceOption {
  type: "packet" | "weight-based"
  weight: number
  price: number
  salePrice?: number | null
}

interface Category {
  _id: string
  name: string
  description?: string
  isActive: boolean
  images: { public_id: string; url: string }[]
}

interface Product {
  _id: string
  name: string
  priceOptions: PriceOption[]
  images: { public_id: string; url: string }[]
  slug: string
  stock: number
  categories: string[] | Category[] // Accept both string IDs and full category objects
  createdAt: string
}

type SortOption =
  | "featured"
  | "alphabetical-asc"
  | "alphabetical-desc"
  | "price-asc"
  | "price-desc"
  | "date-asc"
  | "date-desc"

interface FilterState {
  availability: {
    inStock: boolean
    outOfStock: boolean
  }
  categories: Record<string, boolean>
}

export default function CategoryProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState<string | null>(null)
  const params = useParams()

  // Filter and sort states
  const [filters, setFilters] = useState<FilterState>({
    availability: {
      inStock: false,
      outOfStock: false,
    },
    categories: {},
  })
  const [sortBy, setSortBy] = useState<SortOption>("featured")

  // Mobile filter panel states with separate animation state
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [animateMobileFilter, setAnimateMobileFilter] = useState(false)

  // Accordion states for mobile filter panel
  const [availabilityAccordionOpen, setAvailabilityAccordionOpen] = useState(false)
  const [categoriesAccordionOpen, setCategoriesAccordionOpen] = useState(false)

  // Dropdown states for desktop
  const [availabilityOpen, setAvailabilityOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  // Refs for timeouts
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialFilterApplied = useRef(false)

  // Extract category slug from URL params
  useEffect(() => {
    if (params && params.category) {
      // Handle both string and array cases
      const categorySlug = Array.isArray(params.category) ? params.category[0] : params.category

      // Convert slug to readable name (replace hyphens with spaces and capitalize)
      const formattedName = categorySlug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

      setCategoryName(formattedName)
    }
  }, [params])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  // Apply category filter when categories are loaded and category name is available
  useEffect(() => {
    if (categories.length > 0 && categoryName && !initialFilterApplied.current) {
      // Find the category that matches the name from URL
      const matchedCategory = categories.find((cat) => cat.name.toLowerCase() === categoryName.toLowerCase())

      if (matchedCategory) {
        // Update filters to select this category
        setFilters((prev) => ({
          ...prev,
          categories: {
            ...prev.categories,
            [matchedCategory._id]: true,
          },
        }))
        initialFilterApplied.current = true
      }
    }
  }, [categories, categoryName])

  useEffect(() => {
    applyFiltersAndSort()
  }, [products, filters, sortBy])

  // Close mobile filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showMobileFilter && !target.closest(".mobile-filter-panel")) {
        closeMobileFilter()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMobileFilter])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        credentials: "include",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products")
      }

      setProducts(data.data.products)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        credentials: "include",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch categories")
      }

      // Handle different response formats
      let categoriesData
      if (Array.isArray(data)) {
        categoriesData = data
      } else if (data.data && Array.isArray(data.data.categories)) {
        categoriesData = data.data.categories
      } else if (data.categories && Array.isArray(data.categories)) {
        categoriesData = data.categories
      } else {
        categoriesData = []
        console.error("Unexpected categories data format:", data)
      }

      const activeCategories = categoriesData.filter((category: Category) => category.isActive)
      setCategories(activeCategories)

      // Initialize categories filter state
      const categoriesState: Record<string, boolean> = {}
      activeCategories.forEach((category: Category) => {
        categoriesState[category._id] = false
      })

      setFilters((prev) => ({
        ...prev,
        categories: categoriesState,
      }))
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const applyFiltersAndSort = () => {
    // Apply filters
    let result = [...products]

    // Filter by availability
    const availabilityFiltersActive = filters.availability.inStock || filters.availability.outOfStock
    if (availabilityFiltersActive) {
      result = result.filter((product) => {
        if (filters.availability.inStock && product.stock > 0) return true
        if (filters.availability.outOfStock && product.stock === 0) return true
        return false
      })
    }

    // Filter by categories
    const categoryFiltersActive = Object.values(filters.categories).some((selected) => selected)
    if (categoryFiltersActive) {
      result = result.filter((product) => {
        // Handle both string IDs and full category objects
        if (typeof product.categories[0] === "string") {
          // If categories are just string IDs
          return (product.categories as string[]).some((categoryId) => filters.categories[categoryId])
        } else {
          // If categories are full objects
          return (product.categories as Category[]).some((category) => filters.categories[category._id])
        }
      })
    }

    // Apply sorting
    switch (sortBy) {
      case "alphabetical-asc":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "alphabetical-desc":
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "price-asc":
        result.sort((a, b) => {
          const aPrice = getLowestPrice(a)
          const bPrice = getLowestPrice(b)
          return aPrice - bPrice
        })
        break
      case "price-desc":
        result.sort((a, b) => {
          const aPrice = getLowestPrice(a)
          const bPrice = getLowestPrice(b)
          return bPrice - aPrice
        })
        break
      case "date-asc":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "date-desc":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "featured":
      default:
        // Keep original order for featured
        break
    }

    setFilteredProducts(result)
  }

  const getLowestPrice = (product: Product) => {
    if (!product.priceOptions || product.priceOptions.length === 0) return 0
    const sortedPrices = [...product.priceOptions].sort((a, b) => a.price - b.price)
    return sortedPrices[0].salePrice || sortedPrices[0].price
  }

  const handleAvailabilityChange = (key: "inStock" | "outOfStock") => {
    setFilters((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [key]: !prev.availability[key],
      },
    }))
  }

  const handleCategoryChange = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryId]: !prev.categories[categoryId],
      },
    }))
  }

  const resetFilters = (filterType: "availability" | "categories") => {
    if (filterType === "availability") {
      setFilters((prev) => ({
        ...prev,
        availability: {
          inStock: false,
          outOfStock: false,
        },
      }))
    } else if (filterType === "categories") {
      const resetCategories: Record<string, boolean> = {}
      Object.keys(filters.categories).forEach((key) => {
        resetCategories[key] = false
      })

      setFilters((prev) => ({
        ...prev,
        categories: resetCategories,
      }))

      // Reset the initialFilterApplied flag so we can reapply if needed
      initialFilterApplied.current = false
    }
  }

  const getSelectedCount = (filterType: "availability" | "categories") => {
    if (filterType === "availability") {
      return Object.values(filters.availability).filter(Boolean).length
    } else {
      return Object.values(filters.categories).filter(Boolean).length
    }
  }

  const handleBuyNow = (product: Product) => {
    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart`,
    })
  }

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case "featured":
        return "Featured"
      case "alphabetical-asc":
        return "Alphabetically, A-Z"
      case "alphabetical-desc":
        return "Alphabetically, Z-A"
      case "price-asc":
        return "Price, low to high"
      case "price-desc":
        return "Price, high to low"
      case "date-asc":
        return "Date, old to new"
      case "date-desc":
        return "Date, new to old"
      default:
        return "Featured"
    }
  }

  const openMobileFilter = () => {
    // First make the panel visible
    setShowMobileFilter(true)
    // Then trigger the animation after a tiny delay to ensure DOM update
    setTimeout(() => {
      setAnimateMobileFilter(true)
    }, 10)
  }

  const closeMobileFilter = () => {
    // First reverse the animation
    setAnimateMobileFilter(false)
    // Then hide the panel after animation completes
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    animationTimeoutRef.current = setTimeout(() => {
      setShowMobileFilter(false)
    }, 300) // Match this with the CSS transition duration
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Loading products...</div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  const inStockCount = products.filter((p) => p.stock > 0).length
  const outOfStockCount = products.filter((p) => p.stock === 0).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{categoryName ? `All ${categoryName}` : "All Products"}</h2>
      </div>

      {/* Desktop Filters - Hidden on mobile */}
      <div className="hidden md:flex md:flex-row justify-between items-start mb-6">
        <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
          <div className="text-base font-medium">Filter:</div>

          {/* Availability Filter */}
          <div className="relative">
            <button
              className="flex items-center justify-between min-w-[200px] px-4 py-2 border rounded-lg"
              onClick={() => {
                setAvailabilityOpen(!availabilityOpen)
                setCategoriesOpen(false)
                setSortOpen(false)
              }}
            >
              <span>Availability</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>

            {availabilityOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg">
                <div className="p-3 border-b flex justify-between items-center">
                  <span>{getSelectedCount("availability")} selected</span>
                  <button className="text-black underline" onClick={() => resetFilters("availability")}>
                    Reset
                  </button>
                </div>
                <div className="p-3">
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={filters.availability.inStock}
                      onChange={() => handleAvailabilityChange("inStock")}
                    />
                    <span>In stock ({inStockCount})</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={filters.availability.outOfStock}
                      onChange={() => handleAvailabilityChange("outOfStock")}
                    />
                    <span>Out of stock ({outOfStockCount})</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Categories Filter */}
          <div className="relative">
            <button
              className="flex items-center justify-between min-w-[200px] px-4 py-2 border rounded-lg"
              onClick={() => {
                setCategoriesOpen(!categoriesOpen)
                setAvailabilityOpen(false)
                setSortOpen(false)
              }}
            >
              <span>Categories</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>

            {categoriesOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg">
                <div className="p-3 border-b flex justify-between items-center">
                  <span>{getSelectedCount("categories")} selected</span>
                  <button className="text-black underline" onClick={() => resetFilters("categories")}>
                    Reset
                  </button>
                </div>
                <div className="p-3 max-h-[300px] overflow-y-auto">
                  {categories.length > 0 ? (
                    categories.map((category) => {
                      // Count products in this category
                      const count = products.filter((p) => {
                        if (typeof p.categories[0] === "string") {
                          return (p.categories as string[]).includes(category._id)
                        } else {
                          return (p.categories as Category[]).some((c) => c._id === category._id)
                        }
                      }).length

                      return (
                        <label key={category._id} className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={filters.categories[category._id] || false}
                            onChange={() => handleCategoryChange(category._id)}
                          />
                          <span>
                            {category.name} ({count})
                          </span>
                        </label>
                      )
                    })
                  ) : (
                    <div className="py-2 text-gray-500">No categories available</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sort By - Desktop */}
        <div className="flex items-center">
          <div className="text-base font-medium mr-2">Sort by:</div>
          <div className="relative">
            <button
              className="flex items-center justify-between min-w-[200px] px-4 py-2 border rounded-lg"
              onClick={() => {
                setSortOpen(!sortOpen)
                setAvailabilityOpen(false)
                setCategoriesOpen(false)
              }}
            >
              <span>{getSortLabel(sortBy)}</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>

            {sortOpen && (
              <div className="absolute right-0 z-10 mt-1 w-full bg-white border rounded-lg shadow-lg">
                {[
                  "featured" as SortOption,
                  "alphabetical-asc" as SortOption,
                  "alphabetical-desc" as SortOption,
                  "price-asc" as SortOption,
                  "price-desc" as SortOption,
                  "date-asc" as SortOption,
                  "date-desc" as SortOption,
                ].map((option) => (
                  <button
                    key={option}
                    className={`block w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white ${
                      sortBy === option ? "bg-blue-500 text-white" : ""
                    }`}
                    onClick={() => {
                      setSortBy(option)
                      setSortOpen(false)
                    }}
                  >
                    {getSortLabel(option)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Button - Visible only on mobile */}
      <div className="md:hidden mb-4">
        <button
          onClick={openMobileFilter}
          className="flex items-center justify-center gap-2 w-full max-w-[200px] py-3 px-4 border border-gray-300 rounded-full"
        >
          <Filter className="h-4 w-4" />
          <span>Filter and sort</span>
        </button>

        <div className="mt-2 text-gray-600">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Mobile Filter Panel - Slide in from right with animation */}
      {showMobileFilter && (
        <div
          className={`fixed inset-0 bg-black z-50 md:hidden transition-opacity duration-300 ease-in-out ${
            animateMobileFilter ? "bg-opacity-50" : "bg-opacity-0"
          }`}
          style={{ pointerEvents: animateMobileFilter ? "auto" : "none" }}
        >
          <div
            className={`mobile-filter-panel fixed top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto ${
              animateMobileFilter ? "translate-x-0" : "translate-x-full"
            }`}
            style={{ willChange: "transform" }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">Filter and sort</h3>
              <button onClick={closeMobileFilter} className="p-1">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Filter Accordions */}
            <div className="divide-y">
              {/* Availability Accordion */}
              <div className="py-3 px-4">
                <button
                  className="flex justify-between items-center w-full py-2"
                  onClick={() => setAvailabilityAccordionOpen(!availabilityAccordionOpen)}
                >
                  <span className="text-base font-medium">Availability</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-200 ${availabilityAccordionOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {availabilityAccordionOpen && (
                  <div className="mt-2 pl-2">
                    <div className="flex justify-between items-center mb-2">
                      <span>{getSelectedCount("availability")} selected</span>
                      <button className="text-black underline text-sm" onClick={() => resetFilters("availability")}>
                        Reset
                      </button>
                    </div>
                    <label className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={filters.availability.inStock}
                        onChange={() => handleAvailabilityChange("inStock")}
                      />
                      <span>In stock ({inStockCount})</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={filters.availability.outOfStock}
                        onChange={() => handleAvailabilityChange("outOfStock")}
                      />
                      <span>Out of stock ({outOfStockCount})</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Categories Accordion */}
              <div className="py-3 px-4">
                <button
                  className="flex justify-between items-center w-full py-2"
                  onClick={() => setCategoriesAccordionOpen(!categoriesAccordionOpen)}
                >
                  <span className="text-base font-medium">Categories</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-200 ${categoriesAccordionOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {categoriesAccordionOpen && (
                  <div className="mt-2 pl-2">
                    <div className="flex justify-between items-center mb-2">
                      <span>{getSelectedCount("categories")} selected</span>
                      <button className="text-black underline text-sm" onClick={() => resetFilters("categories")}>
                        Reset
                      </button>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                      {categories.length > 0 ? (
                        categories.map((category) => {
                          const count = products.filter((p) => {
                            if (typeof p.categories[0] === "string") {
                              return (p.categories as string[]).includes(category._id)
                            } else {
                              return (p.categories as Category[]).some((c) => c._id === category._id)
                            }
                          }).length

                          return (
                            <label key={category._id} className="flex items-center space-x-2 mb-2">
                              <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={filters.categories[category._id] || false}
                                onChange={() => handleCategoryChange(category._id)}
                              />
                              <span>
                                {category.name} ({count})
                              </span>
                            </label>
                          )
                        })
                      ) : (
                        <div className="py-2 text-gray-500">No categories available</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sort By Section */}
              <div className="py-3 px-4">
                <div className="mb-2 text-base font-medium">Sort by:</div>
                <div className="relative">
                  <button
                    className="flex items-center justify-between w-full px-4 py-2 border rounded-lg"
                    onClick={() => setSortOpen(!sortOpen)}
                  >
                    <span>{getSortLabel(sortBy)}</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </button>

                  {sortOpen && (
                    <div className="absolute left-0 right-0 z-10 mt-1 bg-white border rounded-lg shadow-lg">
                      {[
                        "featured" as SortOption,
                        "alphabetical-asc" as SortOption,
                        "alphabetical-desc" as SortOption,
                        "price-asc" as SortOption,
                        "price-desc" as SortOption,
                        "date-asc" as SortOption,
                        "date-desc" as SortOption,
                      ].map((option) => (
                        <button
                          key={option}
                          className={`block w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white ${
                            sortBy === option ? "bg-blue-500 text-white" : ""
                          }`}
                          onClick={() => {
                            setSortBy(option)
                            setSortOpen(false)
                          }}
                        >
                          {getSortLabel(option)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product count - Desktop only */}
      <div className="hidden md:block mb-6 text-gray-600">
        {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-xl font-medium mb-2">No products match your filters</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or browse our full collection</p>
          <Button
            variant="outline"
            onClick={() => {
              resetFilters("availability")
              resetFilters("categories")
              setSortBy("featured")
              closeMobileFilter()
            }}
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
  {filteredProducts.map((product) => {
    const sortedPrices = product.priceOptions.sort((a, b) => a.price - b.price);
    const lowestPriceOption = sortedPrices[0];
    const displayPrice = lowestPriceOption?.salePrice || lowestPriceOption?.price;

    return (
      <div key={product._id} className="border border-gray-200 rounded-lg overflow-hidden group flex flex-col">
        <Link href={`/product/${product._id}`} className="flex-grow flex flex-col">
          <div className="aspect-square relative">
            <Image
              src={product.images[0]?.url || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
            />
          </div>

          <div className="p-3 md:p-5 flex flex-col flex-grow">
            <div className="text-[14px] text-[#1D1D1D]">
              {product.priceOptions.length > 1 ? "From " : ""}
              {displayPrice ? `Rs. ${displayPrice.toFixed(2)}` : "Price not available"}
            </div>

            <div className="relative group flex-grow">
              <h3 className="font-semibold text-[15px] md:text-[17px] lg:text-2xl md:font-bold mt-1 relative after:content-[''] after:block after:w-full after:h-[2px] after:bg-black after:scale-x-0 after:transition-transform after:duration-300 after:origin-left group-hover:after:scale-x-100">
                {product.name}
              </h3>
            </div>
          </div>
        </Link>

        {/* Buy Now Button - Fixed at Bottom */}
        <div className="p-3 md:p-5 pt-0 mt-auto">
          <Button
            variant="outline"
            className="w-full text-sm md:text-base rounded-full border-black hover:bg-black hover:text-white"
            onClick={(e) => {
              e.preventDefault();
              handleBuyNow(product);
            }}
          >
            Buy now
          </Button>
        </div>
      </div>
    );
  })}
</div>
      )}
    </div>
  )
}

