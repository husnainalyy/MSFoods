"use client"

import type React from "react"

import { useState } from "react"
import { Star, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import Cookies from "js-cookie"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

interface ReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productName: string
  orderId: string
  onReviewSubmitted?: () => void
}

export function ReviewDialog({
  isOpen,
  onClose,
  productId,
  productName,
  orderId,
  onReviewSubmitted,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])

  const handleRatingClick = (value: number) => {
    setRating(value)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)

      // Limit to 3 images
      if (selectedImages.length + filesArray.length > 3) {
        toast({
          title: "Error",
          description: "You can upload a maximum of 3 images",
          variant: "destructive",
        })
        return
      }

      // Create preview URLs
      const newImageUrls = filesArray.map((file) => URL.createObjectURL(file))

      setSelectedImages([...selectedImages, ...filesArray])
      setImagePreviewUrls([...imagePreviewUrls, ...newImageUrls])
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...selectedImages]
    const newImageUrls = [...imagePreviewUrls]

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newImageUrls[index])

    newImages.splice(index, 1)
    newImageUrls.splice(index, 1)

    setSelectedImages(newImages)
    setImagePreviewUrls(newImageUrls)
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("accessToken") || Cookies.get("accessToken")

      // Create form data for file upload
      const formData = new FormData()
      formData.append("productId", productId)
      formData.append("orderId", orderId)
      formData.append("rating", rating.toString())
      formData.append("comment", comment)

      // Add images if any
      selectedImages.forEach((image) => {
        formData.append("images", image)
      })

      const response = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review")
      }

      toast({
        title: "Success",
        description: "Your review has been submitted for approval",
      })

      // Reset form
      setRating(0)
      setComment("")
      setSelectedImages([])
      setImagePreviewUrls([])

      // Close dialog and notify parent
      onClose()
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clean up object URLs when component unmounts
  const handleClose = () => {
    imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url))
    setImagePreviewUrls([])
    setSelectedImages([])
    setRating(0)
    setComment("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review Product</DialogTitle>
          <DialogDescription>Share your experience with {productName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRatingClick(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500">
                {rating > 0 ? `${rating} out of 5 stars` : "Select a rating"}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Your Review
            </label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right">{comment.length}/500 characters</p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add Photos (Optional)</label>
            <div className="flex flex-wrap gap-2">
              {/* Image previews */}
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative h-20 w-20 rounded-md overflow-hidden border">
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Preview ${index}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-black bg-opacity-50 rounded-bl-md p-1"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}

              {/* Upload button */}
              {selectedImages.length < 3 && (
                <label className="flex items-center justify-center h-20 w-20 border-2 border-dashed rounded-md border-gray-300 cursor-pointer hover:border-gray-400">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" multiple />
                  <Upload className="h-6 w-6 text-gray-400" />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500">You can upload up to 3 images (max 5MB each)</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

