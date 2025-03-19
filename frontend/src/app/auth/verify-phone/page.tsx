"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

const verifyPhoneSchema = z.object({
    code: z.string().min(4, "Verification code is required"),
})

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function VerifyPhonePage() {
    const { toast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()
    const rawPhone = searchParams.get("phone")

    // Format phone correctly
    let phone = rawPhone ? decodeURIComponent(rawPhone).trim() : null
    if (phone && !phone.startsWith("+")) {
        phone = `+${phone.replace(/\s+/g, "")}` // Remove spaces and add +
    }

    const [isLoading, setIsLoading] = useState(false)
    const [resendDisabled, setResendDisabled] = useState(false)
    const [countdown, setCountdown] = useState(60)

    const form = useForm<z.infer<typeof verifyPhoneSchema>>({
        resolver: zodResolver(verifyPhoneSchema),
        defaultValues: {
            code: "",
        },
    })

    useEffect(() => {
        console.log("Formatted phone:", phone)
        if (!phone) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Phone number is missing",
            })
            router.push("/auth/signup")
        }
    }, [phone, router, toast])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (resendDisabled && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        } else if (countdown === 0) {
            setResendDisabled(false)
        }
        return () => clearTimeout(timer)
    }, [resendDisabled, countdown])

    async function onSubmit(values: z.infer<typeof verifyPhoneSchema>) {
        if (!phone) return

        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/auth/verify-phone`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, code: values.code }),
            })

            const data = await response.json()

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: data.message || "Verification failed",
                    variant: "destructive",
                })
                setIsLoading(false)
                return
            }

            toast({
                title: "Phone Verified",
                description: "Your phone number has been verified successfully",
            })

            router.push("/auth/login")
        } catch (error: unknown) {
            toast({
                variant: "destructive",
                title: "Verification Error",
                description: error instanceof Error ? error.message : "An unknown error occurred",
            })
        } finally {
            setIsLoading(false)
        }
    }

    async function handleResendCode() {
        if (!phone) return

        setResendDisabled(true)
        setCountdown(60)

        try {
            const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: phone }),
            })

            const data = await response.json()

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: data.message || "Failed to resend code",
                    variant: "destructive",
                })
                return
            }

            toast({
                title: "Code Resent",
                description: "A new verification code has been sent to your phone",
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
                    <CardTitle className="text-2xl">Verify Your Phone</CardTitle>
                    <CardDescription>Enter the verification code sent to {phone}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Verification Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter code" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? "Verifying..." : "Verify Phone"}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-4 text-center">
                        <Button variant="link" onClick={handleResendCode} disabled={resendDisabled} className="text-sm">
                            {resendDisabled ? `Resend code in ${countdown}s` : "Didn't receive a code? Resend"}
                        </Button>
                    </div>

                    <div className="mt-4 text-center text-sm">
                        <Link href="/auth/login" className="text-primary hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
    