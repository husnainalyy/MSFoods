"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Edit, Trash2, Loader2, Upload, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { authFetch } from "@/app/utils/auth-helpers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface CategoryImage {
    public_id: string
    url: string
}

interface Category {
    _id: string
    name: string
    description: string
    isActive: boolean
    images?: CategoryImage[]
}

interface Settings {
    _id: string
    shippingFee: number
}

export default function SettingsPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [settings, setSettings] = useState<Settings | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
    const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false)
    const [isEditShippingDialogOpen, setIsEditShippingDialogOpen] = useState(false)
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
    const [newCategory, setNewCategory] = useState({ name: "", description: "", isActive: true })
    const [newShippingFee, setNewShippingFee] = useState(0)
    const [categoryImages, setCategoryImages] = useState<File[]>([])
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
    const [editCategoryImages, setEditCategoryImages] = useState<File[]>([])
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
    const { toast } = useToast()

    const fetchCategories = useCallback(async () => {
        try {
            const response = await authFetch(`${API_URL}/api/categories`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error("Failed to fetch categories")
            }

            setCategories(Array.isArray(data) ? data : [])
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch categories",
            })
        }
    }, [toast])

    const fetchSettings = useCallback(async () => {
        try {
            const response = await authFetch(`${API_URL}/api/settings`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error("Failed to fetch settings")
            }

            setSettings(data)
            setNewShippingFee(data.shippingFee)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch settings",
            })
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchCategories()
        fetchSettings()
    }, [fetchCategories, fetchSettings])

    const handleDeleteCategory = async (categoryId: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return

        setIsLoading(true)
        try {
            const response = await authFetch(`${API_URL}/api/categories/${categoryId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete category")
            }

            fetchCategories()
            toast({
                title: "Success",
                description: "Category deleted successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete category",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData()
            formData.append("name", newCategory.name)
            formData.append("description", newCategory.description)
            formData.append("isActive", String(newCategory.isActive))

            // Append images to form data
            if (categoryImages.length > 0) {
                categoryImages.forEach((image) => {
                    formData.append("images", image)
                })
            }

            // Debug: Log FormData entries
            logFormData(formData)

            const token = localStorage.getItem("accessToken")
            const response = await fetch(`${API_URL}/api/categories`, {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error("Failed to add category")
            }

            fetchCategories()
            setIsAddCategoryDialogOpen(false)
            setNewCategory({ name: "", description: "", isActive: true })
            setCategoryImages([])
            setImagePreview(null)
            toast({
                title: "Success",
                description: "Category added successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add category",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentCategory) return

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append("name", currentCategory.name)
            formData.append("description", currentCategory.description)
            formData.append("isActive", String(currentCategory.isActive))

            // Only append images if there are new ones to upload
            if (editCategoryImages.length > 0) {
                editCategoryImages.forEach((image) => {
                    formData.append("images", image)
                })
            } else {
                // If no new images, tell the server to keep existing ones
                formData.append("keepExistingImages", "true")
            }

            // Add images to delete if any
            if (imagesToDelete.length > 0) {
                formData.append("imagesToDelete", JSON.stringify(imagesToDelete))
            }

            // Debug: Log FormData entries
            logFormData(formData)

            const token = localStorage.getItem("accessToken")
            const response = await fetch(`${API_URL}/api/categories/${currentCategory._id}`, {
                method: "PUT",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to update category")
            }

            fetchCategories()
            setIsEditCategoryDialogOpen(false)
            setCurrentCategory(null)
            setEditCategoryImages([])
            setEditImagePreview(null)
            setImagesToDelete([])
            toast({
                title: "Success",
                description: "Category updated successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update category",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateShipping = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!settings) return

        setIsLoading(true)
        try {
            const token = localStorage.getItem("accessToken")
            const response = await fetch(`${API_URL}/api/settings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ shippingFee: newShippingFee }),
            })

            if (!response.ok) {
                throw new Error("Failed to update shipping fee")
            }

            fetchSettings()
            setIsEditShippingDialogOpen(false)
            toast({
                title: "Success",
                description: "Shipping fee updated successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update shipping fee",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setCategoryImages([file])

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setEditCategoryImages([file])

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setEditImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleImageDelete = (publicId: string) => {
        if (currentCategory) {
            setImagesToDelete([...imagesToDelete, publicId])
        }
    }

    const clearImagePreview = () => {
        setImagePreview(null)
        setCategoryImages([])
    }

    const clearEditImagePreview = () => {
        setEditImagePreview(null)
        setEditCategoryImages([])
    }

    const filteredCategories = categories.filter(
        (category) =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (isLoading && !categories.length && !settings) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Store Settings</h1>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Shipping Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    {settings ? (
                        <div className="flex items-center gap-4">
                            <p className="text-lg">Current Shipping Fee: Rs {settings.shippingFee.toFixed(2)}</p>
                            <Dialog open={isEditShippingDialogOpen} onOpenChange={setIsEditShippingDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">Update Shipping Fee</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Update Shipping Fee</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleUpdateShipping} className="space-y-4">
                                        <div>
                                            <Label htmlFor="shippingFee">New Shipping Fee (Rs)</Label>
                                            <Input
                                                id="shippingFee"
                                                type="number"
                                                value={newShippingFee}
                                                onChange={(e) => setNewShippingFee(Number(e.target.value))}
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                                                </>
                                            ) : (
                                                "Update"
                                            )}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ) : (
                        <p>No shipping settings found. Please create shipping settings.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Categories</CardTitle>
                    <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Add New Category</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Category</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddCategory} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={newCategory.description}
                                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="categoryImage">Category Image</Label>
                                    <div className="mt-1">
                                        {imagePreview ? (
                                            <div className="relative w-full h-40 mb-2">
                                                <Image
                                                    src={imagePreview || "/placeholder.svg"}
                                                    alt="Category preview"
                                                    fill
                                                    className="object-cover rounded-md"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-6 w-6"
                                                    onClick={clearImagePreview}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center w-full">
                                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or JPEG (MAX. 5MB)</p>
                                                    </div>
                                                    <input
                                                        id="categoryImage"
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/png, image/jpeg, image/jpg"
                                                        onChange={handleImageChange}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={newCategory.isActive}
                                        onCheckedChange={(checked) => setNewCategory({ ...newCategory, isActive: checked })}
                                    />
                                    <Label htmlFor="isActive">Active</Label>
                                </div>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                                        </>
                                    ) : (
                                        "Add Category"
                                    )}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No categories found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCategories.map((category) => (
                                        <TableRow key={category._id}>
                                            <TableCell>
                                                {category.images && category.images.length > 0 ? (
                                                    <div className="relative h-12 w-12 rounded-md overflow-hidden">
                                                        <Image
                                                            src={category.images[0].url || "/placeholder.svg"}
                                                            alt={category.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                                                        <span className="text-xs text-gray-500">No image</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell>{category.description}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${category.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {category.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Dialog
                                                    open={isEditCategoryDialogOpen && currentCategory?._id === category._id}
                                                    onOpenChange={(open) => {
                                                        setIsEditCategoryDialogOpen(open)
                                                        if (!open) {
                                                            setCurrentCategory(null)
                                                            setEditImagePreview(null)
                                                            setEditCategoryImages([])
                                                            setImagesToDelete([])
                                                        }
                                                    }}
                                                >
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setCurrentCategory(category)
                                                                // Set image preview if category has images
                                                                if (category.images && category.images.length > 0) {
                                                                    setEditImagePreview(category.images[0].url)
                                                                }
                                                            }}
                                                            className="mr-2"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        {currentCategory && (
                                                            <>
                                                                <DialogHeader>
                                                                    <DialogTitle>Edit Category</DialogTitle>
                                                                </DialogHeader>
                                                                <form onSubmit={handleUpdateCategory} className="space-y-4">
                                                                    <div>
                                                                        <Label htmlFor="edit-name">Name</Label>
                                                                        <Input
                                                                            id="edit-name"
                                                                            value={currentCategory.name}
                                                                            onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                                                            required
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="edit-description">Description</Label>
                                                                        <Input
                                                                            id="edit-description"
                                                                            value={currentCategory.description}
                                                                            onChange={(e) =>
                                                                                setCurrentCategory({ ...currentCategory, description: e.target.value })
                                                                            }
                                                                        />
                                                                    </div>

                                                                    {/* Current Images */}
                                                                    {currentCategory.images && currentCategory.images.length > 0 && (
                                                                        <div>
                                                                            <Label>Current Images</Label>
                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                                                                                {currentCategory.images
                                                                                    .filter((img) => !imagesToDelete.includes(img.public_id))
                                                                                    .map((image) => (
                                                                                        <div key={image.public_id} className="relative group">
                                                                                            <Image
                                                                                                src={image.url || "/placeholder.svg"}
                                                                                                alt="Category image"
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
                                                                    )}

                                                                    <div>
                                                                        <Label htmlFor="edit-categoryImage">Upload New Image</Label>
                                                                        <div className="mt-1">
                                                                            {editImagePreview && !currentCategory.images?.length ? (
                                                                                <div className="relative w-full h-40 mb-2">
                                                                                    <Image
                                                                                        src={editImagePreview || "/placeholder.svg"}
                                                                                        alt="Category preview"
                                                                                        fill
                                                                                        className="object-cover rounded-md"
                                                                                    />
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="destructive"
                                                                                        size="icon"
                                                                                        className="absolute top-2 right-2 h-6 w-6"
                                                                                        onClick={clearEditImagePreview}
                                                                                    >
                                                                                        <X className="h-4 w-4" />
                                                                                    </Button>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex items-center justify-center w-full">
                                                                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                                                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                                            <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                                                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                                                                            </p>
                                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                                PNG, JPG or JPEG (MAX. 5MB)
                                                                                            </p>
                                                                                        </div>
                                                                                        <input
                                                                                            id="edit-categoryImage"
                                                                                            type="file"
                                                                                            className="hidden"
                                                                                            accept="image/png, image/jpeg, image/jpg"
                                                                                            onChange={handleEditImageChange}
                                                                                        />
                                                                                    </label>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Switch
                                                                            id="edit-isActive"
                                                                            checked={currentCategory.isActive}
                                                                            onCheckedChange={(checked) =>
                                                                                setCurrentCategory({ ...currentCategory, isActive: checked })
                                                                            }
                                                                        />
                                                                        <Label htmlFor="edit-isActive">Active</Label>
                                                                    </div>
                                                                    <Button type="submit" disabled={isLoading}>
                                                                        {isLoading ? (
                                                                            <>
                                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                                                                            </>
                                                                        ) : (
                                                                            "Update Category"
                                                                        )}
                                                                    </Button>
                                                                </form>
                                                            </>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteCategory(category._id)}
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
                </CardContent>
            </Card>
        </div>
    )
}

/**
 * Logs the contents of a FormData object for debugging
 * @param formData - The FormData object to log
 */
function logFormData(formData: FormData): void {
    console.log("FormData contents:")
    for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`)
    }
}

