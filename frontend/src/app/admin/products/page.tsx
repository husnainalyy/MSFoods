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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"


const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"


const sizeOptions = ["500ml", "1L", "1.5L", "2L"]

interface Product {
    _id: string
    name: string
    description: string
    price: number
    stock: number
    sizes: string[]
    categories: string[]
    images: { public_id: string; url: string }[]
    slug: string
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
    const [minPrice, setMinPrice] = useState(0)
    const [maxPrice, setMaxPrice] = useState(10000)
    const [minStock, setMinStock] = useState(0)
    const [maxStock, setMaxStock] = useState(1000)
    const { toast } = useToast()


    const fetchProducts = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/products/?page=${page}`, {
                credentials: "include",
            });
            const data = await response.json();

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: "Failed to fetch products",
                    variant: "destructive",
                });
                return;
            }

            setProducts(data.data.products);
            setPaginationInfo({
                total: data.data.total,
                results: data.data.results,
                currentPage: data.data.currentPage,
                totalPages: data.data.totalPages,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch products",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/categories`, {
                credentials: "include",
            });
            const data = await response.json();

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: "Failed to fetch categories",
                    variant: "destructive",
                });
                return;
            }

            setCategories(data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch categories",
            });
        }
    }, [toast]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]); // Now dependencies are stable




    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (categoryFilter === "all" || product.categories.includes(categoryFilter)) &&
            product.price >= minPrice &&
            product.price <= maxPrice &&
            product.stock >= minStock &&
            product.stock <= maxStock,
    )

    const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.currentTarget
        const formData = new FormData(form)

        const sizes = formData.getAll("sizes") as string[]
        const categories = formData.getAll("categories") as string[]

        formData.delete("sizes") // Remove old entries
        formData.delete("categories")

        sizes.forEach(size => formData.append("sizes[]", size))
        categories.forEach(category => formData.append("categories[]", category))
        
        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/products`, {
                method: "POST",
                body: formData,
                credentials: "include",
            })

            const data = await response.json()

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: "Failed to add product" + data.message,
                    variant: "destructive",
                })
            }

            setIsAddDialogOpen(false)
            fetchProducts()
            if (response.ok) {
                toast({
                title: "Success",
                description: "Product added successfully",
            })
            }
           
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

        const sizes = formData.getAll("sizes").join(",")
        const categories = formData.getAll("categories").join(",")

        formData.set("sizes", sizes)
        formData.set("categories", categories)

        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/products/${currentProduct._id}`, {
                method: "PUT",
                body: formData,
                credentials: "include",
            })

            const data = await response.json()

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: `Failed to update product: ${data.message || "Unknown error occurred"}`,
                    variant: "destructive",
                })
            }



            setIsEditDialogOpen(false)
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
            const response = await fetch(`${API_URL}/api/products/${id}`, {
                method: "DELETE",
                credentials: "include",
            })

            if (!response.ok) {
                let errorMessage = "Failed to delete image"
                try {
                    const data = await response.json()
                    errorMessage += `: ${data.message || "Unknown error occurred"}`
                } catch {
                    errorMessage += " due to an unknown error"
                }

                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                })
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

    const handleDeleteImage = async (productId: string, imageId: string) => {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/products/${productId}/images/${imageId}`, {
                method: "DELETE",
                credentials: "include",
            })

            if (!response.ok) {
                const data = await response.json()
                toast({
                    title: "Error",
                    description: "Failed to delete image" + data.message,
                    variant: "destructive",
                })
            }

            if (currentProduct) {
                setCurrentProduct({
                    ...currentProduct,
                    images: currentProduct.images.filter((img) => img.public_id !== imageId),
                })
            }

            toast({
                title: "Success",
                description: "Image deleted successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete image",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
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
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Add New Product</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" required />
                                </div>
                                <div>
                                    <Label htmlFor="price">Price</Label>
                                    <Input id="price" name="price" type="number" step="0.01" required />
                                </div>
                                <div>
                                    <Label htmlFor="stock">Stock</Label>
                                    <Input id="stock" name="stock" type="number" required />
                                </div>
                                <div>
                                    <Label htmlFor="images">Images</Label>
                                    <Input id="images" name="images" type="file" multiple accept="image/*" required />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Sizes</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {sizeOptions.map((size) => (
                                            <label key={size} className="flex items-center space-x-2">
                                                <Checkbox name="sizes" value={size} />
                                                <span>{size}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label>Categories</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((category) => (
                                            <label key={category._id} className="flex items-center space-x-2">
                                                <Checkbox name="categories" value={category._id} />
                                                <span>{category.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Adding..." : "Add Product"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px]">
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
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                        <Label>Price Range</Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                type="number"
                                value={minPrice}
                                onChange={(e) => setMinPrice(Number(e.target.value))}
                                className="w-20"
                            />
                            <span>to</span>
                            <Input
                                type="number"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                className="w-20"
                            />
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10000"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <Label>Stock Range</Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                type="number"
                                value={minStock}
                                onChange={(e) => setMinStock(Number(e.target.value))}
                                className="w-20"
                            />
                            <span>to</span>
                            <Input
                                type="number"
                                value={maxStock}
                                onChange={(e) => setMaxStock(Number(e.target.value))}
                                className="w-20"
                            />
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            value={maxStock}
                            onChange={(e) => setMaxStock(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Categories</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map((product) => (
                            <TableRow key={product._id}>
                                <TableCell>
                                    <Image
                                        src={product.images[0]?.url || "/placeholder.svg"}
                                        alt={product.name}
                                        width={100}
                                        height={100}
                                        className="w-12 h-12 object-cover rounded-md"
                                    />
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>Rs {product.price.toFixed(2)}</TableCell>
                                <TableCell>{product.stock}</TableCell>
                                <TableCell>
                                    {product.categories.map((cat) => categories.find((c) => c._id === cat)?.name).join(", ")}
                                </TableCell>
                                <TableCell className="space-x-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            setCurrentProduct(product)
                                            setIsEditDialogOpen(true)
                                        }}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleDeleteProduct(product._id)}
                                        disabled={isLoading}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-4 flex justify-center">
                {Array.from({ length: paginationInfo.totalPages }).map((_, index) => (
                    <Button
                        key={index}
                        onClick={() => fetchProducts(index + 1)}
                        variant={paginationInfo.currentPage === index + 1 ? "default" : "outline"}
                        className="mx-1"
                    >
                        {index + 1}
                    </Button>
                ))}
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-4xl">                 
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                    </DialogHeader>
                    {currentProduct && (
                        <form onSubmit={handleEditProduct} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-name">Name</Label>
                                    <Input id="edit-name" name="name" defaultValue={currentProduct.name} required />
                                </div>
                                <div>
                                    <Label htmlFor="edit-price">Price</Label>
                                    <Input
                                        id="edit-price"
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        defaultValue={currentProduct.price}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-stock">Stock</Label>
                                    <Input id="edit-stock" name="stock" type="number" defaultValue={currentProduct.stock} required />
                                </div>
                                <div>
                                    <Label htmlFor="edit-images">Add Images</Label>
                                    <Input id="edit-images" name="images" type="file" multiple accept="image/*" />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea id="edit-description" name="description" defaultValue={currentProduct.description} required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Sizes</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {sizeOptions.map((size) => (
                                            <label key={size} className="flex items-center space-x-2">
                                                <Checkbox name="sizes" value={size} defaultChecked={currentProduct.sizes.includes(size)} />
                                                <span>{size}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label>Categories</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((category) => (
                                            <label key={category._id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    name="categories"
                                                    value={category._id}
                                                    defaultChecked={currentProduct.categories.includes(category._id)}
                                                />
                                                <span>{category.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label>Current Images</Label>
                                <div className="flex flex-wrap gap-2">
                                    {currentProduct.images.map((image) => (
                                        <div key={image.public_id} className="relative">
                                            <Image
                                                src={image.url || "/placeholder.svg"}
                                                alt={`Product ${image.public_id}`}
                                                width={100}
                                                height={100}
                                                className="w-20 h-20 object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-0 right-0"
                                                onClick={() => handleDeleteImage(currentProduct._id, image.public_id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Updating..." : "Update Product"}
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

