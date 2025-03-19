"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Mail, Phone } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function VerificationSentPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { toast } = useToast()
    const method = searchParams.get("method") || "email"
    const email = searchParams.get("email")
    const [resendDisabled, setResendDisabled] = useState(false)
    const [countdown, setCountdown] = useState(60)

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (resendDisabled && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        } else if (countdown === 0) {
            setResendDisabled(false)
        }
        return () => clearTimeout(timer)
    }, [resendDisabled, countdown])

    async function handleResendVerification() {
        if (!email && method === "email") {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Email is missing",
            })
            return
        }

        setResendDisabled(true)
        setCountdown(60)

        try {
            const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: email }),
            })

            const data = await response.json()

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: data.message || "Failed to resend verification",
                    variant: "destructive",
                })
                return
            }

            toast({
                title: "Verification Resent",
                description:
                    method === "email"
                        ? "A new verification email has been sent"
                        : "A new verification code has been sent to your phone",
            })
        } catch (error: unknown) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "An unknown error occurred",
            })
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        {method === "email" ? (
                            <Mail className="h-6 w-6 text-primary" />
                        ) : (
                            <Phone className="h-6 w-6 text-primary" />
                        )}
                    </div>
                    <CardTitle className="text-2xl text-center">Verification Sent</CardTitle>
                    <CardDescription className="text-center">
                        {method === "email"
                            ? "We've sent a verification link to your email address. Please check your inbox and click the link to verify your account."
                            : "We've sent a verification code to your phone. Please enter the code to verify your account."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <Button variant="outline" onClick={handleResendVerification} disabled={resendDisabled} className="mt-4">
                        {resendDisabled ? `Resend in ${countdown}s` : `Resend ${method === "email" ? "Email" : "Code"}`}
                    </Button>

                    <div className="mt-6 text-center text-sm">
                        <Link href="/auth/login" className="text-primary hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

