"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Star, Upload, X } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"]
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"
const fileSchema = typeof File !== "undefined" ? z.instanceof(File) : z.any();

const reviewSchema = z.object({
    productId: z.string().nonempty("Please select a product"),
    rating: z.number().min(1, "Please select a rating").max(5),
    comment: z.string().min(10, "Comment must be at least 10 characters long"),
    images: z
        .array(fileSchema)
        .refine(
            (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
            `Max file size is 10MB.`
        )
        .refine(
            (files) => files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
            "Only .jpg, .jpeg, .png formats are supported."
        )
        .optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>

interface OrderItem {
    product: {
        _id: string
        name: string
        images: Array<{ url: string }>
    }
    name: string
    quantity: number
    price: number
    image: string
    _id: string
}

interface ReviewModalProps {
    order: {
        _id: string
        items: OrderItem[]
    }
    onClose: () => void
}

export default function ReviewModal({ order, onClose }: ReviewModalProps) {
    const [selectedProduct, setSelectedProduct] = useState<OrderItem | null>(null)
    const { toast } = useToast()

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            productId: "",
            rating: 0,
            comment: "",
            images: [],
        },
    })

    const onSubmit = async (values: ReviewFormValues) => {
        try {
            const formData = new FormData()
            formData.append("productId", values.productId)
            formData.append("orderId", order._id)
            formData.append("rating", values.rating.toString())
            formData.append("comment", values.comment)

            if (values.images && values.images.length > 0) {
                values.images.forEach((image) => {
                    formData.append("images", image)
                })
            }

            const response = await fetch(`${API_URL}/api/reviews`, {
                method: "POST",
                body: formData,
                credentials: "include",
            })

            if (!response.ok) {
                const errorData = await response.json()
                toast({
                    title: "Error",
                    description: "Failed to submit review" + errorData.message,
                    variant: "destructive",
                })
            }

            toast({
                title: "Review Submitted",
                description: `Thank you for your feedback on ${selectedProduct?.name}!`,
            })
            form.reset()
            setSelectedProduct(null)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to submit review. Please try again.",
            })
        }
    }

    const handleProductSelect = (productId: string) => {
        const product = order.items.find((item) => item.product._id === productId)
        if (product) {
            setSelectedProduct(product)
            form.setValue("productId", productId)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        form.setValue("images", files as File[])
    }

    const removeImage = (imageIndex: number) => {
        const currentImages = form.getValues("images") || []
        const updatedImages = currentImages.filter((_, i) => i !== imageIndex)
        form.setValue("images", updatedImages)
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <VisuallyHidden> 
                        <DialogTitle>Leave a Review</DialogTitle>
                    </VisuallyHidden>
                    <DialogDescription>Select a product from your order to review</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="productId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Product</FormLabel>
                                    <Select onValueChange={(value) => handleProductSelect(value)} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a product to review" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {order.items.map((item) => (
                                                <SelectItem key={item.product._id} value={item.product._id}>
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}  
                        />

                        {selectedProduct && (
                            <div className="max-w-2xl max-h-[50vh] overflow-auto">
                                <div className="flex items-center gap-4 mb-4">
                                    <Image
                                        src={selectedProduct.image || "/placeholder.svg"}
                                        alt={selectedProduct.name}
                                        width={60}
                                        height={60}
                                        className="rounded-md"
                                    />
                                    <div>
                                        <h3 className="font-medium">{selectedProduct.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Quantity: {selectedProduct.quantity} | Price: Rs {selectedProduct.price.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="rating"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rating</FormLabel>
                                            <FormControl>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={`star-${star}`}
                                                            className={`h-6 w-6 cursor-pointer transition-colors ${star <= field.value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                                                }`}
                                                            onClick={() => form.setValue("rating", star)}
                                                        />
                                                    ))}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="comment"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Comment</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Write your review here... (minimum 10 characters)"
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormItem>
                                    <FormLabel>Images (Optional)</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => document.getElementById("image-upload")?.click()}
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload Images
                                            </Button>
                                            <input
                                                id="image-upload"
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>

                                {(form.watch("images") ?? []).length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {((form.watch("images") as File[]) ?? []).map((file: File, imageIndex: number) => (
                                            <div key={`image-${imageIndex}`} className="relative">
                                                <Image
                                                    src={URL.createObjectURL(file) || "/placeholder.svg"}
                                                    alt={`Preview ${imageIndex + 1}`}
                                                    width={100}
                                                    height={100}
                                                    className="object-cover rounded"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                                    onClick={() => removeImage(imageIndex)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <Button type="submit" className="w-full">
                                    Submit Review
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

