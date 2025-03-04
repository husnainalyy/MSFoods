import { useState } from "react"
import { Star, ChevronDown, ChevronUp } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface Review {
    _id: string
    user: {
        _id: string
        name: string
    }
    rating: number
    comment: string
    images: string[]
    createdAt: string
}

interface ReviewProps {
    reviews: Review[]
}

export default function ReviewSection({ reviews }: ReviewProps) {
    const [expandedReview, setExpandedReview] = useState<string | null>(null)
    const numOfReviews = reviews.length
    const productRating = reviews.reduce((acc, review) => acc + review.rating, 0) / numOfReviews

    if (!reviews || reviews.length === 0) {
        return (
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
                <p>No reviews yet. Be the first to review this product!</p>
            </div>
        )
    }

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
            <div className="flex items-center mb-4">
                <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`w-5 h-5 ${star <= Math.round(productRating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                    ))}
                </div>
                <span className="ml-2 text-gray-600">
                    {productRating.toFixed(1)} out of 5 ({numOfReviews} reviews)
                </span>
            </div>
            <div className="space-y-4">
                {reviews.map((review) => (
                    <motion.div
                        key={review._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center mb-2">
                            <div className="mr-2 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-semibold">{review.user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                                <p className="font-semibold">{review.user.name}</p>
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-4 h-4 ${star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => setExpandedReview(expandedReview === review._id ? null : review._id)}
                                className="ml-auto"
                            >
                                {expandedReview === review._id ? <ChevronUp /> : <ChevronDown />}
                            </button>
                        </div>
                        <AnimatePresence>
                            {expandedReview === review._id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <p className="text-gray-600 mb-2">{review.comment}</p>
                                    {review.images && review.images.length > 0 && (
                                        <div className="mt-2 flex space-x-2">
                                            {review.images.map((image, index) => (
                                                <Image
                                                    key={index}
                                                    src={image || "/placeholder.svg"}
                                                    alt={`Review image ${index + 1}`}
                                                    width={100}
                                                    height={100}
                                                    className="rounded-md object-cover"
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

