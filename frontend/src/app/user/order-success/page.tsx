"use client"

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function OrderSuccessPage() {
    const router = useRouter();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center h-full">
                <CheckCircle className="text-green-500 mb-4" size={80} />
                <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Thank you for your purchase. Your order has been placed successfully.
                </p>
                <Button onClick={() => router.push("/")} className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Continue Shopping
                </Button>
               
            </div>
        </div>
    );
}