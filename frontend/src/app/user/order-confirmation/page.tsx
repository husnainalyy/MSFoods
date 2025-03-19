import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function OrderConfirmationPage() {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
            <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
            <p className="mb-8">Thank you for your purchase. Your order has been received and is being processed.</p>
            <Link href="/" className="text-blue-600 hover:underline">
                Continue Shopping
            </Link>
        </div>
    )
}

