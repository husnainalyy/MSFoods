"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { authFetch } from "@/app/utils/auth-helpers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface PriceOption {
    type: "packet" | "weight-based"
    weight: number
    price: number
    salePrice?: number | null
}

interface Product {
    _id: string
    name: string
    description: string
    stock: number
    priceOptions: PriceOption[]
    categories: string[]
    images: { public_id: string; url: string }[]
    sale?: number | null
    slug: string
    ratings?: number
    numOfReviews?: number
}

interface PaginationInfo {
    total: number
    results: number
    currentPage: number
    totalPages: number
}

interface Category {
    _id: string
    name: string
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
        total: 0,
        results: 0,
        currentPage: 1,
        totalPages: 1,
    })
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const { toast } = useToast()

    // Add state for price options
    const [priceOptions, setPriceOptions] = useState<PriceOption[]>([
        { type: "packet", weight: 500, price: 0, salePrice: null },
    ])

    // State for images to delete during edit
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

    const fetchProducts = useCallback(
        async (page = 1) => {
            setIsLoading(true)
            try {
                const response = await authFetch(`${API_URL}/api/products?page=${page}`)
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch products")
                }

                setProducts(data.data.products)
                setPaginationInfo({
                    total: data.data.total,
                    results: data.data.results,
                    currentPage: data.data.currentPage,
                    totalPages: data.data.totalPages,
                })
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to fetch products",
                })
            } finally {
                setIsLoading(false)
            }
        },
        [toast],
    )

    const fetchCategories = useCallback(async () => {
        try {
            const response = await authFetch(`${API_URL}/api/categories`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch categories")
            }

            setCategories(data)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch categories",
            })
        }
    }, [toast])

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [fetchProducts, fetchCategories])

    const handleAddPriceOption = () => {
        setPriceOptions([...priceOptions, { type: "packet", weight: 500, price: 0, salePrice: null }])
    }

    const handleRemovePriceOption = (index: number) => {
        setPriceOptions(priceOptions.filter((_, i) => i !== index))
    }

    const handlePriceOptionChange = (index: number, field: keyof PriceOption, value: any) => {
        const newPriceOptions = [...priceOptions]
        newPriceOptions[index] = { ...newPriceOptions[index], [field]: value }
        setPriceOptions(newPriceOptions)
    }
    
    const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.currentTarget
        const formData = new FormData(form)

        // Get selected categories
        const selectedCategories = Array.from(form.querySelectorAll('input[name="categories"]:checked')).map(
            (checkbox) => (checkbox as HTMLInputElement).value,
        )

        // Remove any existing categories from formData
        formData.delete("categories")

        // Add each category
        selectedCategories.forEach((category) => {
            formData.append("categories", category)
        })

        // Replace the fetch call in handleAddProduct with:
        // Add price options to form data
        formData.delete("priceOptions")

        // Convert priceOptions to a properly formatted JSON string
        const priceOptionsString = JSON.stringify(priceOptions)
        formData.append("priceOptions", priceOptionsString)

        // Log the FormData for debugging
        console.log("Price options string:", priceOptionsString)
        logFormData(formData)

        setIsLoading(true)
        try {
            const token = localStorage.getItem("accessToken")

            const response = await fetch(`${API_URL}/api/products`, {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Failed to add product")
            }

            setIsAddDialogOpen(false)
            fetchProducts()
            setPriceOptions([{ type: "packet", weight: 500, price: 0, salePrice: null }])
            toast({
                title: "Success",
                description: "Product added successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add product",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditProduct = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!currentProduct) return

        const form = event.currentTarget
        const formData = new FormData(form)

        // Get selected categories
        const selectedCategories = Array.from(form.querySelectorAll('input[name="categories"]:checked')).map(
            (checkbox) => (checkbox as HTMLInputElement).value,
        )

        // Remove any existing categories from formData
        formData.delete("categories")

        // Add each category
        selectedCategories.forEach((category) => {
            formData.append("categories", category)
        })

        // Add price options to form data
        formData.delete("priceOptions")

        // Convert priceOptions to a properly formatted JSON string
        const priceOptionsString = JSON.stringify(priceOptions)
        formData.append("priceOptions", priceOptionsString)

        // Log the FormData for debugging
        console.log("Price options string:", priceOptionsString)
        logFormData(formData)

        // Add images to delete
        if (imagesToDelete.length > 0) {
            formData.append("imagesToDelete", JSON.stringify(imagesToDelete))
        }

        setIsLoading(true)
        try {
            const token = localStorage.getItem("accessToken")

            const response = await fetch(`${API_URL}/api/products/${currentProduct._id}`, {
                method: "PUT",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Failed to update product")
            }

            setIsEditDialogOpen(false)
            setImagesToDelete([])
            fetchProducts()
            toast({
                title: "Success",
                description: "Product updated successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update product",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return

        setIsLoading(true)
        try {
            const response = await authFetch(`${API_URL}/api/products/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || "Failed to delete product")
            }

            fetchProducts()
            toast({
                title: "Success",
                description: "Product deleted successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete product",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleImageDelete = (publicId: string) => {
        if (currentProduct) {
            setImagesToDelete([...imagesToDelete, publicId])
        }
    }

    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (categoryFilter === "all" || product.categories.includes(categoryFilter)),
    )

    if (isLoading && !products.length) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h1 className="text-2xl font-bold mb-4 sm:mb-0">Products ({paginationInfo.total})</h1>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Product</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddProduct} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" required />
                                </div>
                                <div>
                                    <Label htmlFor="stock">Stock</Label>
                                    <Input id="stock" name="stock" type="number" min="0" required />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" required />
                            </div>

                            <div>
                                <Label>Categories</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                    {categories.map((category) => (
                                        <label key={category._id} className="flex items-center space-x-2">
                                            <Checkbox id={`add-category-${category._id}`} name="categories" value={category._id} />
                                            <span>{category.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label>Price Options</Label>
                                <div className="space-y-4 mt-2">
                                    {priceOptions.map((option, index) => (
                                        <div key={index} className="p-4 border rounded-lg space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label>Price Option {index + 1}</Label>
                                                {index > 0 && (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleRemovePriceOption(index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>

                                            <RadioGroup
                                                value={option.type}
                                                onValueChange={(value) =>
                                                    handlePriceOptionChange(index, "type", value as "packet" | "weight-based")
                                                }
                                                className="flex space-x-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="packet" id={`packet-${index}`} />
                                                    <Label htmlFor={`packet-${index}`}>Packet</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="weight-based" id={`weight-${index}`} />
                                                    <Label htmlFor={`weight-${index}`}>Weight Based</Label>
                                                </div>
                                            </RadioGroup>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label>Weight (g)</Label>
                                                    <Input
                                                        type="number"
                                                        value={option.weight}
                                                        onChange={(e) => handlePriceOptionChange(index, "weight", Number(e.target.value))}
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Price</Label>
                                                    <Input
                                                        type="number"
                                                        value={option.price}
                                                        onChange={(e) => handlePriceOptionChange(index, "price", Number(e.target.value))}
                                                        min="0"
                                                        step="0.01"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Sale Price (Optional)</Label>
                                                    <Input
                                                        type="number"
                                                        value={option.salePrice || ""}
                                                        onChange={(e) =>
                                                            handlePriceOptionChange(
                                                                index,
                                                                "salePrice",
                                                                e.target.value ? Number(e.target.value) : null,
                                                            )
                                                        }
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" onClick={handleAddPriceOption}>
                                        Add Price Option
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="images">Images</Label>
                                <Input id="images" name="images" type="file" multiple accept="image/*" required />
                            </div>

                            <div>
                                <Label htmlFor="sale">Global Sale Percentage (Optional)</Label>
                                <Input id="sale" name="sale" type="number" min="0" max="100" placeholder="Enter sale percentage" />
                            </div>

                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                                    </>
                                ) : (
                                    "Add Product"
                                )}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Price Range</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Categories</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No products found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product._id}>
                                    <TableCell>
                                        <Image
                                            src={product.images[0]?.url || "/placeholder.svg?height=50&width=50"}
                                            alt={product.name}
                                            width={50}
                                            height={50}
                                            className="rounded-md object-cover"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>
                                        {product.priceOptions.length > 0 ? (
                                            <>
                                                Rs. {Math.min(...product.priceOptions.map((o) => o.price))} -{" "}
                                                {Math.max(...product.priceOptions.map((o) => o.price))}
                                            </>
                                        ) : (
                                            "No price set"
                                        )}
                                    </TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell>
                                        {product.categories
                                            .map((catId) => categories.find((c) => c._id === catId)?.name)
                                            .filter(Boolean)
                                            .join(", ")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setCurrentProduct(product)
                                                setPriceOptions(product.priceOptions)
                                                setImagesToDelete([])
                                                setIsEditDialogOpen(true)
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteProduct(product._id)}
                                            disabled={isLoading}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {paginationInfo.totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                    {Array.from({ length: paginationInfo.totalPages }, (_, i) => (
                        <Button
                            key={i + 1}
                            variant={paginationInfo.currentPage === i + 1 ? "default" : "outline"}
                            onClick={() => fetchProducts(i + 1)}
                            disabled={isLoading}
                        >
                            {i + 1}
                        </Button>
                    ))}
                </div>
            )}

            {/* Edit Product Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                    </DialogHeader>
                    {currentProduct && (
                        <form onSubmit={handleEditProduct} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-name">Name</Label>
                                    <Input id="edit-name" name="name" defaultValue={currentProduct.name} required />
                                </div>
                                <div>
                                    <Label htmlFor="edit-stock">Stock</Label>
                                    <Input
                                        id="edit-stock"
                                        name="stock"
                                        type="number"
                                        min="0"
                                        defaultValue={currentProduct.stock}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea id="edit-description" name="description" defaultValue={currentProduct.description} required />
                            </div>

                            <div>
                                <Label>Categories</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                    {categories.map((category) => (
                                        <label key={category._id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`edit-category-${category._id}`}
                                                name="categories"
                                                value={category._id}
                                                defaultChecked={currentProduct.categories.includes(category._id)}
                                            />
                                            <span>{category.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label>Price Options</Label>
                                <div className="space-y-4 mt-2">
                                    {priceOptions.map((option, index) => (
                                        <div key={index} className="p-4 border rounded-lg space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label>Price Option {index + 1}</Label>
                                                {index > 0 && (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleRemovePriceOption(index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>

                                            <RadioGroup
                                                value={option.type}
                                                onValueChange={(value) =>
                                                    handlePriceOptionChange(index, "type", value as "packet" | "weight-based")
                                                }
                                                className="flex space-x-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="packet" id={`edit-packet-${index}`} />
                                                    <Label htmlFor={`edit-packet-${index}`}>Packet</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="weight-based" id={`edit-weight-${index}`} />
                                                    <Label htmlFor={`edit-weight-${index}`}>Weight Based</Label>
                                                </div>
                                            </RadioGroup>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label>Weight (g)</Label>
                                                    <Input
                                                        type="number"
                                                        value={option.weight}
                                                        onChange={(e) => handlePriceOptionChange(index, "weight", Number(e.target.value))}
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Price</Label>
                                                    <Input
                                                        type="number"
                                                        value={option.price}
                                                        onChange={(e) => handlePriceOptionChange(index, "price", Number(e.target.value))}
                                                        min="0"
                                                        step="0.01"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Sale Price (Optional)</Label>
                                                    <Input
                                                        type="number"
                                                        value={option.salePrice || ""}
                                                        onChange={(e) =>
                                                            handlePriceOptionChange(
                                                                index,
                                                                "salePrice",
                                                                e.target.value ? Number(e.target.value) : null,
                                                            )
                                                        }
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" onClick={handleAddPriceOption}>
                                        Add Price Option
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label>Current Images</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                                    {currentProduct.images
                                        .filter((img) => !imagesToDelete.includes(img.public_id))
                                        .map((image) => (
                                            <div key={image.public_id} className="relative group">
                                                <Image
                                                    src={image.url || "/placeholder.svg"}
                                                    alt="Product image"
                                                    width={100}
                                                    height={100}
                                                    className="w-full h-24 object-cover rounded-md"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleImageDelete(image.public_id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="edit-images">Add New Images</Label>
                                <Input id="edit-images" name="images" type="file" multiple accept="image/*" />
                            </div>

                            <div>
                                <Label htmlFor="edit-sale">Global Sale Percentage (Optional)</Label>
                                <Input
                                    id="edit-sale"
                                    name="sale"
                                    type="number"
                                    min="0"
                                    max="100"
                                    defaultValue={currentProduct.sale || ""}
                                    placeholder="Enter sale percentage"
                                />
                            </div>

                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                                    </>
                                ) : (
                                    "Update Product"
                                )}
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

/**
 * Logs the contents of a FormData object for debugging
 * @param formData - The FormData object to log
 */
export function logFormData(formData: FormData): void {
    console.log("FormData contents:")
    for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`)
    }
}

/**
 * Converts a JavaScript object to FormData
 * @param data - The object to convert
 * @returns FormData object
 */
export function objectToFormData(data: Record<string, any>): FormData {
    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            return
        }

        if (Array.isArray(value) || typeof value === "object") {
            formData.append(key, JSON.stringify(value))
        } else {
            formData.append(key, value.toString())
        }
    })

    return formData
}

