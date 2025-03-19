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
import { useState } from "react"
import { Loader2, Mail, Phone } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

const emailSchema = z.object({
    identifier: z.string().email("Invalid email address"),
})

const phoneSchema = z.object({
    identifier: z.string().min(10, "Invalid phone number"),
})

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [verificationMethod, setVerificationMethod] = useState<"email" | "phone">("phone")

    const emailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: { identifier: "" },
    })

    const phoneForm = useForm<z.infer<typeof phoneSchema>>({
        resolver: zodResolver(phoneSchema),
        defaultValues: { identifier: "" },
    })

    async function onSubmit(values: z.infer<typeof emailSchema> | z.infer<typeof phoneSchema>) {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            const data = await response.json()

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: data.message || "Request failed",
                    variant: "destructive",
                })
                setIsLoading(false)
                return
            }

            toast({
                title: verificationMethod === "email" ? "Email Sent" : "SMS Sent",
                description:
                    verificationMethod === "email"
                        ? "Check your email for password reset instructions"
                        : "Check your phone for the password reset code",
            })
            // Redirect to the verify-otp page with the identifier and method
            if (verificationMethod === "phone") {
                router.push(`/auth/verify-otp?identifier=${encodeURIComponent(values.identifier)}&method=${verificationMethod}`)
            } else if (verificationMethod === "email") {
                router.push('/auth/email-sent') // or any other page you want to redirect to
            }

        
        } catch (error: unknown) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error instanceof Error ? error.message : "An error occurred",
        })
    } finally {
        setIsLoading(false)
    }
}

return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl">Reset Password</CardTitle>
                <CardDescription>Choose how you want to receive the reset instructions</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="phone" onValueChange={(value) => setVerificationMethod(value as "email" | "phone")}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="phone" className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Phone
                        </TabsTrigger>
                        <TabsTrigger value="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="email">
                        <Form {...emailForm}>
                            <form onSubmit={emailForm.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={emailForm.control}
                                    name="identifier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="john@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLoading ? "Sending..." : "Send Reset Link"}
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="phone">
                        <Form {...phoneForm}>
                            <form onSubmit={phoneForm.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={phoneForm.control}
                                    name="identifier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1234567890" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLoading ? "Sending..." : "Send Reset Code"}
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 text-center text-sm">
                    Remember your password?{" "}
                    <Link href="/auth/login" className="font-medium text-primary hover:underline">
                        Login
                    </Link>
                </div>
            </CardContent>
        </Card>
    </div>
)
}

