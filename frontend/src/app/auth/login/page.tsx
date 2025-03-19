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
import {useUser} from "@/app/Component/user-context.tsx"

const emailLoginSchema = z.object({
    identifier: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
})

const phoneLoginSchema = z.object({
    identifier: z.string().min(10, "Invalid phone number"),
    password: z.string().min(1, "Password is required"),
})

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function LoginPage() {
    const { toast } = useToast()
    const router = useRouter()
    const { login } = useUser()
    const [isLoading, setIsLoading] = useState(false)
    const [verificationMethod, setVerificationMethod] = useState<"email" | "phone">("phone")

    const emailForm = useForm<z.infer<typeof emailLoginSchema>>({
        resolver: zodResolver(emailLoginSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    })

    const phoneForm = useForm<z.infer<typeof phoneLoginSchema>>({
        resolver: zodResolver(phoneLoginSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof emailLoginSchema> | z.infer<typeof phoneLoginSchema>) {
        setIsLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            const result = await response.json()

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: result.message || "Login failed",
                    variant: "destructive",
                })
                setIsLoading(false)
                return
            }

            // Store user and tokens using the login function from context
            login(result.data.user, {
                accessToken: result.data.accessToken,
                refreshToken: result.data.refreshToken,
            })

            toast({
                title: "Login Successful",
                description: "You are being redirected...",
            })

            // Redirect based on user role
            if (result.data.user.role === "admin") {
                router.push("/admin/products")
            } else {
                router.push("/")
            }
        } catch (error: unknown) {
            toast({
                variant: "destructive",
                title: "Login Error",
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
                    <CardTitle className="text-2xl">Welcome Back</CardTitle>
                    <CardDescription>Enter your credentials to login to your account</CardDescription>
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
                                    <FormField
                                        control={emailForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between">
                                                    <FormLabel>Password</FormLabel>
                                                    <Link href="/auth/forgot-password" className="text-sm text-muted-foreground hover:underline">
                                                        Forgot password?
                                                    </Link>
                                                </div>
                                                <FormControl>
                                                    <Input type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isLoading ? "Logging In..." : "Login"}
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
                                    <FormField
                                        control={phoneForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between">
                                                    <FormLabel>Password</FormLabel>
                                                    <Link href="/auth/forgot-password" className="text-sm text-muted-foreground hover:underline">
                                                        Forgot password?
                                                    </Link>
                                                </div>
                                                <FormControl>
                                                    <Input type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isLoading ? "Logging In..." : "Login"}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>

                    <div className="mt-6 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                            Sign Up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

