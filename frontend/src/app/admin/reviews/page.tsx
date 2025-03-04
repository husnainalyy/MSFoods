"use client"

import { useState, useEffect, useCallback } from "react"
import { Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

interface Review {
    _id: string
    product: {
        _id: string
        name: string
       
    }
    user: {
        _id: string
        name: string
    }
    rating: number
    comment: string
    images: string[]
    isApproved: boolean
    createdAt: string
    updatedAt: string
}

interface ReviewsResponse {
    success: boolean
    message: string
    data: {
        reviews: Review[]
        total: number
        pages: number
        page: number
    }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"


export default function Reviews() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [currentReview, setCurrentReview] = useState<Review | null>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const { toast } = useToast()

    
    const fetchReviews = useCallback(async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/reviews/allReviews?page=${currentPage}&search=${searchTerm}`,
                {
                    credentials: "include",
                }
            );
            const data: ReviewsResponse = await response.json();
            setReviews(data.data.reviews);
            setTotalPages(data.data.pages);
        } catch {
            toast({
                title: "Error",
                description: "Failed to fetch reviews. Please try again.",
                variant: "destructive",
            });
        }
    }, [currentPage, searchTerm, toast]); // Dependencies added to keep it stable

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]); // Now `useEffect` runs only when needed

    const handleApprovalChange = async (reviewId: string, isApproved: boolean) => {
        try {
            const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ isApproved }),
                credentials: "include",
            })
            if (response.ok) {
                fetchReviews()
                toast({
                    title: "Success",
                    description: `Review ${isApproved ? "approved" : "unapproved"} successfully.`,
                })
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update review approval",
                    variant: "destructive",
                })
            }
        } catch  {
            toast({
                title: "Error",
                description: "Failed to update review approval. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleDeleteReview = async (reviewId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
                method: "DELETE",
                credentials: "include",
            })
            if (response.ok) {
                fetchReviews()
                toast({
                    title: "Success",
                    description: "Review deleted successfully.",
                })
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete review",
                    variant: "destructive",
                })
            }
        } catch  {
            toast({
                title: "Error",
                description: "Failed to delete review. Please try again.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-5">Reviews</h1>
            <div className="mb-5">
                <Input
                    className="max-w-sm"
                    placeholder="Search reviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reviews.map((review) => (
                        <TableRow key={review._id}>
                            <TableCell>{review.product.name}</TableCell>
                            <TableCell>{review.user.name}</TableCell>
                            <TableCell>{review.rating}</TableCell>
                            <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Select
                                    onValueChange={(value) => handleApprovalChange(review._id, value === "true")}
                                    defaultValue={review.isApproved ? "true" : "false"}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Approved</SelectItem>
                                        <SelectItem value="false">Not Approved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="icon" onClick={() => setCurrentReview(review)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl">
                                            <DialogHeader>
                                                <DialogTitle>Review Details</DialogTitle>
                                            </DialogHeader>
                                            {currentReview && (
                                                <div className="grid gap-4">
                                                    <p>
                                                        <strong>Product:</strong> {currentReview.product.name}
                                                    </p>
                                                    <p>
                                                        <strong>User:</strong> {currentReview.user.name}
                                                    </p>
                                                    <p>
                                                        <strong>Rating:</strong> {currentReview.rating}
                                                    </p>
                                                    <p>
                                                        <strong>Comment:</strong> {currentReview.comment}
                                                    </p>
                                                    <p>
                                                        <strong>Date:</strong> {new Date(currentReview.createdAt).toLocaleString()}
                                                    </p>
                                                    <p>
                                                        <strong>Status:</strong> {currentReview.isApproved ? "Approved" : "Not Approved"}
                                                    </p>
                                                    {currentReview.images.length > 0 && (
                                                        <div>
                                                            <strong>Images:</strong>
                                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                                                {currentReview.images.map((image, index) => (
                                                                    <Image
                                                                        key={index}
                                                                        src={image || "/placeholder.svg"}
                                                                        alt={`Review image ${index + 1}`}
                                                                        width={200}
                                                                        height={200}
                                                                        className="object-cover rounded"
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                    <Button variant="outline" size="icon" onClick={() => handleDeleteReview(review._id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
                <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    )
}

