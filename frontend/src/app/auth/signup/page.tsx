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
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const emailSignupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    verificationMethod: z.literal("email"),
})

const phoneSignupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(10, "Invalid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    verificationMethod: z.literal("phone"),
})

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function SignupPage() {
    const { toast } = useToast()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [verificationMethod, setVerificationMethod] = useState<"email" | "phone">("phone")

    const emailForm = useForm<z.infer<typeof emailSignupSchema>>({
        resolver: zodResolver(emailSignupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            verificationMethod: "email",
        },
    })

    const phoneForm = useForm<z.infer<typeof phoneSignupSchema>>({
        resolver: zodResolver(phoneSignupSchema),
        defaultValues: {
            name: "",
            phone: "",
            password: "",
            verificationMethod: "phone",
        },
    })

    async function onSubmitEmail(values: z.infer<typeof emailSignupSchema>) {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })

            const data = await response.json()

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: data.message || "Signup failed",
                    variant: "destructive",
                })
                setIsLoading(false)
                return
            }

            toast({
                title: "Verification Email Sent",
                description: "Please check your email to verify your account",
            })

            router.push("/auth/verification-sent?method=email")
        } catch (error: unknown) {
            toast({
                variant: "destructive",
                title: "Signup Error",
                description: error instanceof Error ? error.message : "An unknown error occurred",
            })
        } finally {
            setIsLoading(false)
        }
    }

    async function onSubmitPhone(values: z.infer<typeof phoneSignupSchema>) {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })

            const data = await response.json()

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: data.message || "Signup failed",
                    variant: "destructive",
                })
                setIsLoading(false)
                return
            }

            toast({
                title: "Verification Code Sent",
                description: "Please check your phone for the verification code",
            })

            router.push(`/auth/verify-phone?phone=${values.phone}`)
        } catch (error: unknown) {
            toast({
                variant: "destructive",
                title: "Signup Error",
                description: error instanceof Error ? error.message : "An unknown error occurred",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Create Account</CardTitle>
                    <CardDescription>Enter your information to create an account</CardDescription>
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
                                <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
                                    <FormField
                                        control={emailForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={emailForm.control}
                                        name="email"
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
                                    <FormField
                                        control={emailForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isLoading ? "Creating Account..." : "Sign Up with Email"}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="phone">
                            <Form {...phoneForm}>
                                <form onSubmit={phoneForm.handleSubmit(onSubmitPhone)} className="space-y-4">
                                    <FormField
                                        control={phoneForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={phoneForm.control}
                                        name="phone"
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
                                    <FormField
                                        control={phoneForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isLoading ? "Creating Account..." : "Sign Up with Phone"}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>

                    <div className="mt-6 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="font-medium text-primary hover:underline">
                            Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

