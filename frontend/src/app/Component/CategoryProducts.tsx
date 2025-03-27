"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { X, Filter, Check, Tag, Package, Clock, ArrowUpDown } from "lucide-react"
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
  onSale: boolean
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
    onSale: false,
  })
  const [sortBy, setSortBy] = useState<SortOption>("featured")

  // Filter panel states
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [activeFilterTab, setActiveFilterTab] = useState<"categories" | "availability" | "sort">("categories")

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

  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showFilterPanel && !target.closest(".filter-panel") && !target.closest(".filter-toggle")) {
        setShowFilterPanel(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showFilterPanel])

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

  const handleOnSaleChange = () => {
    setFilters((prev) => ({
      ...prev,
      onSale: !prev.onSale,
    }))
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

    // Filter by on sale
    if (filters.onSale) {
      result = result.filter((product) => {
        return product.priceOptions.some((option) => option.salePrice !== null && option.salePrice !== undefined)
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

  const resetFilters = (filterType: "availability" | "categories" | "all") => {
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
    } else if (filterType === "all") {
      const resetCategories: Record<string, boolean> = {}
      Object.keys(filters.categories).forEach((key) => {
        resetCategories[key] = false
      })

      setFilters({
        availability: {
          inStock: false,
          outOfStock: false,
        },
        categories: resetCategories,
        onSale: false,
      })

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

  const getTotalSelectedFilters = () => {
    return getSelectedCount("availability") + getSelectedCount("categories") + (filters.onSale ? 1 : 0)
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

  const getActiveFilters = () => {
    const active = []

    if (filters.onSale) {
      active.push({ type: "onSale", label: "On Sale" })
    }

    if (filters.availability.inStock) {
      active.push({ type: "availability", key: "inStock", label: "In Stock" })
    }

    if (filters.availability.outOfStock) {
      active.push({ type: "availability", key: "outOfStock", label: "Out of Stock" })
    }

    Object.entries(filters.categories).forEach(([key, value]) => {
      if (value) {
        const category = categories.find((c) => c._id === key)
        if (category) {
          active.push({ type: "category", key, label: category.name })
        }
      }
    })

    return active
  }

  const removeFilter = (filter: { type: string; key?: string; label: string }) => {
    if (filter.type === "onSale") {
      setFilters((prev) => ({ ...prev, onSale: false }))
    } else if (filter.type === "availability" && filter.key) {
      handleAvailabilityChange(filter.key as "inStock" | "outOfStock")
    } else if (filter.type === "category" && filter.key) {
      handleCategoryChange(filter.key)
    }
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
  const activeFilters = getActiveFilters()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{categoryName ? `All ${categoryName}` : "All Products"}</h2>
      </div>

      {/* New Filter Design */}
      <div className="mb-6">
        {/* Filter Toggle Button */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`filter-toggle flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              showFilterPanel ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {getTotalSelectedFilters() > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-medium rounded-full bg-primary text-white">
                {getTotalSelectedFilters()}
              </span>
            )}
          </button>

          {/* Sort Button */}
          <button
            onClick={() => {
              setShowFilterPanel(true)
              setActiveFilterTab("sort")
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>{getSortLabel(sortBy)}</span>
          </button>

          {/* On Sale Quick Filter */}
          <button
            onClick={handleOnSaleChange}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              filters.onSale ? "bg-red-500 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <Tag className="h-4 w-4" />
            <span>On Sale</span>
          </button>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <button onClick={() => resetFilters("all")} className="text-sm text-gray-600 hover:text-black ml-2">
              Clear all
            </button>
          )}
        </div>

        {/* Active Filter Tags */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map((filter, index) => (
              <div
                key={`${filter.type}-${filter.key || index}`}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                <span>{filter.label}</span>
                <button onClick={() => removeFilter(filter)} className="ml-1 rounded-full hover:bg-gray-200 p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Filter Panel */}
        {showFilterPanel && (
          <div className="filter-panel fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-medium">Filter & Sort</h3>
                <button onClick={() => setShowFilterPanel(false)} className="p-1 rounded-full hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b">
                <button
                  className={`flex-1 py-3 text-center font-medium ${activeFilterTab === "categories" ? "text-black border-b-2 border-black" : "text-gray-500"}`}
                  onClick={() => setActiveFilterTab("categories")}
                >
                  Categories
                </button>
                <button
                  className={`flex-1 py-3 text-center font-medium ${activeFilterTab === "availability" ? "text-black border-b-2 border-black" : "text-gray-500"}`}
                  onClick={() => setActiveFilterTab("availability")}
                >
                  Availability
                </button>
                <button
                  className={`flex-1 py-3 text-center font-medium ${activeFilterTab === "sort" ? "text-black border-b-2 border-black" : "text-gray-500"}`}
                  onClick={() => setActiveFilterTab("sort")}
                >
                  Sort
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeFilterTab === "categories" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Categories</h4>
                      {getSelectedCount("categories") > 0 && (
                        <button
                          className="text-sm text-primary hover:underline"
                          onClick={() => resetFilters("categories")}
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((category) => {
                        const isSelected = filters.categories[category._id] || false
                        const count = products.filter((p) => {
                          if (typeof p.categories[0] === "string") {
                            return (p.categories as string[]).includes(category._id)
                          } else {
                            return (p.categories as Category[]).some((c) => c._id === category._id)
                          }
                        }).length

                        return (
                          <button
                            key={category._id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              isSelected ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleCategoryChange(category._id)}
                          >
                            <span className="text-sm font-medium">{category.name}</span>
                            <span className={`text-xs ${isSelected ? "text-white" : "text-gray-500"}`}>({count})</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {activeFilterTab === "availability" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Availability</h4>
                      {getSelectedCount("availability") > 0 && (
                        <button
                          className="text-sm text-primary hover:underline"
                          onClick={() => resetFilters("availability")}
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <button
                        className={`flex items-center justify-between w-full p-3 rounded-lg border ${
                          filters.availability.inStock
                            ? "border-black bg-black text-white"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleAvailabilityChange("inStock")}
                      >
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5" />
                          <span className="font-medium">In Stock</span>
                        </div>
                        <span className={filters.availability.inStock ? "text-white" : "text-gray-500"}>
                          ({inStockCount})
                        </span>
                      </button>

                      <button
                        className={`flex items-center justify-between w-full p-3 rounded-lg border ${
                          filters.availability.outOfStock
                            ? "border-black bg-black text-white"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleAvailabilityChange("outOfStock")}
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5" />
                          <span className="font-medium">Out of Stock</span>
                        </div>
                        <span className={filters.availability.outOfStock ? "text-white" : "text-gray-500"}>
                          ({outOfStockCount})
                        </span>
                      </button>

                      <button
                        className={`flex items-center justify-between w-full p-3 rounded-lg border ${
                          filters.onSale
                            ? "border-red-500 bg-red-500 text-white"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={handleOnSaleChange}
                      >
                        <div className="flex items-center gap-3">
                          <Tag className="h-5 w-5" />
                          <span className="font-medium">On Sale</span>
                        </div>
                        <span className={filters.onSale ? "text-white" : "text-gray-500"}>
                          ({products.filter((p) => p.priceOptions.some((o) => o.salePrice)).length})
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {activeFilterTab === "sort" && (
                  <div>
                    <h4 className="font-medium mb-4">Sort By</h4>
                    <div className="space-y-2">
                      {[
                        { value: "featured" as SortOption, label: "Featured" },
                        { value: "alphabetical-asc" as SortOption, label: "Alphabetically, A-Z" },
                        { value: "alphabetical-desc" as SortOption, label: "Alphabetically, Z-A" },
                        { value: "price-asc" as SortOption, label: "Price, low to high" },
                        { value: "price-desc" as SortOption, label: "Price, high to low" },
                        { value: "date-asc" as SortOption, label: "Date, old to new" },
                        { value: "date-desc" as SortOption, label: "Date, new to old" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          className={`flex items-center justify-between w-full p-3 rounded-lg ${
                            sortBy === option.value ? "bg-black text-white" : "hover:bg-gray-100"
                          }`}
                          onClick={() => {
                            setSortBy(option.value)
                          }}
                        >
                          <span>{option.label}</span>
                          {sortBy === option.value && <Check className="h-5 w-5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      resetFilters("all")
                      setSortBy("featured")
                    }}
                  >
                    Reset All
                  </button>
                  <button
                    className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800"
                    onClick={() => setShowFilterPanel(false)}
                  >
                    View Results ({filteredProducts.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product count */}
      <div className="mb-6 text-gray-600">
        {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <h3 className="text-xl font-medium mb-2">No products match your filters</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or browse our full collection</p>
          <Button
            variant="outline"
            className="rounded-lg border-black text-black hover:bg-black hover:text-white"
            onClick={() => {
              resetFilters("all")
              setSortBy("featured")
              setShowFilterPanel(false)
            }}
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => {
            const sortedPrices = product.priceOptions.sort((a, b) => a.price - b.price)
            const lowestPriceOption = sortedPrices[0]
            const displayPrice = lowestPriceOption?.salePrice || lowestPriceOption?.price
            const isOnSale = product.priceOptions.some(
              (option) => option.salePrice !== null && option.salePrice !== undefined,
            )

            return (
              <div key={product._id} className="border border-gray-200 rounded-lg overflow-hidden group flex flex-col">
                <Link href={`/user/product/${product._id}`} className="flex-grow flex flex-col">
                  <div className="aspect-square relative">
                    <Image
                      src={product.images[0]?.url || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    />
                    {isOnSale && (
                      <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 text-xs font-bold">
                        SALE
                      </div>
                    )}
                  </div>

                  <div className="p-3 md:p-5 flex flex-col flex-grow">
                    <div className="text-[14px] text-[#1D1D1D]">
                      {product.priceOptions.length > 1 ? "From " : ""}
                      {lowestPriceOption?.salePrice ? (
                        <span>
                          <span className="line-through text-gray-500 mr-2">
                            Rs. {lowestPriceOption.price.toFixed(2)}
                          </span>
                          <span className="text-red-500">Rs. {lowestPriceOption.salePrice.toFixed(2)}</span>
                        </span>
                      ) : displayPrice ? (
                        `Rs. ${displayPrice.toFixed(2)}`
                      ) : (
                        "Price not available"
                      )}
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
                <Link href={`/user/product/${product._id}`}>
                  <Button
                    variant="outline"
                    className="w-full text-sm md:text-base rounded-full border-black hover:bg-black hover:text-white"
                  >
                    Buy now
                  </Button>
                </Link>
              </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

