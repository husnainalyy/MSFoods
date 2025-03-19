"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function VerifyEmailPage() {
    const { toast } = useToast()
    const router = useRouter()
    const { token } = useParams()

    const [isLoading, setIsLoading] = useState(true)
    const [isVerified, setIsVerified] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!token) {
            setError("Missing verification token")
            setIsLoading(false)
            return
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(`${API_URL}/api/auth/verify-email/${token}`)
                const data = await response.json()

                if (!response.ok) {
                    setError(data.message || "Verification failed")
                    setIsVerified(false)
                } else {
                    setIsVerified(true)
                    toast({
                        title: "Email Verified",
                        description: "Your email has been verified successfully",
                    })
                }
            } catch (error) {
                setError("An unexpected error occurred")
                setIsVerified(false)
            } finally {
                setIsLoading(false)
            }
        }

        verifyEmail()
    }, [token, toast])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
                    <CardDescription className="text-center">
                        {isLoading
                            ? "Verifying your email..."
                            : isVerified
                                ? "Your email has been verified"
                                : "Verification failed"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="mt-4 text-muted-foreground">Please wait while we verify your email...</p>
                        </div>
                    ) : isVerified ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                            <p className="mt-4 text-center">
                                Your email has been verified successfully. You can now log in to your account.
                            </p>
                            <Button className="mt-6" onClick={() => router.push("/auth/login")}>
                                Go to Login
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                            <XCircle className="h-12 w-12 text-red-500" />
                            <p className="mt-4 text-center text-red-500">{error || "Verification failed"}</p>
                            <div className="mt-6 flex flex-col gap-4">
                                <Link href="/auth/resend-verification">
                                    <Button variant="outline" className="w-full">
                                        Resend Verification
                                    </Button>
                                </Link>
                                <Link href="/auth/login">
                                    <Button className="w-full">Back to Login</Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

