        "use client"

        import { zodResolver } from "@hookform/resolvers/zod"
        import { useForm } from "react-hook-form"
        import { z } from "zod"
        import { Button } from "@/components/ui/button"
        import { Input } from "@/components/ui/input"
        import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
        import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
        import { useToast } from "@/components/ui/use-toast"
        import { useState } from "react"
        import { Loader2, Eye, EyeOff } from "lucide-react"
        import { useRouter, useSearchParams } from "next/navigation"
        import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

        const formSchema = z
            .object({
                otp: z.string().min(4, "Verification code is required"),
                password: z.string().min(6, "Password must be at least 6 characters"),
                confirmPassword: z.string(),
            })
            .refine((data) => data.password === data.confirmPassword, {
                message: "Passwords don't match",
                path: ["confirmPassword"],
            })

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

        export default function VerifyOTPPage() {
            const { toast } = useToast()
            const router = useRouter()
            const searchParams = useSearchParams()
            const identifier = searchParams.get("identifier") // This could be email or phone
            const method = searchParams.get("method") || "phone" // Default to phone

            const [isLoading, setIsLoading] = useState(false)
            const [showPassword, setShowPassword] = useState(false)
            const [showConfirmPassword, setShowConfirmPassword] = useState(false)

            const form = useForm<z.infer<typeof formSchema>>({
                resolver: zodResolver(formSchema),
                defaultValues: { otp: "", password: "", confirmPassword: "" },
            })

            async function onSubmit(values: z.infer<typeof formSchema>) {
                if (!identifier) {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: `${method === "email" ? "Email" : "Phone number"} is missing`,
                    })
                    return
                }

                setIsLoading(true)
                try {
                    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            identifier,
                            code: values.otp,
                            password: values.password,
                            method,
                        }),
                    })

                    const data = await response.json()

                    if (!response.ok) {
                        toast({
                            title: "Error",
                            description: data.message || "Reset failed",
                            variant: "destructive",
                        })
                        setIsLoading(false)
                        return
                    }

                    toast({
                        title: "Password Updated",
                        description: "Your password has been reset successfully",
                    })

                    router.push("/auth/login")
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
                            <CardTitle className="text-2xl">Verify & Reset Password</CardTitle>
                            <CardDescription>
                                Enter the verification code sent to your {method === "email" ? "email" : "phone"} and create a new password
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="otp"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Verification Code</FormLabel>
                                                <FormControl>
                                                    <InputOTP maxLength={6} {...field}>
                                                        <InputOTPGroup>
                                                            <InputOTPSlot index={0} />
                                                            <InputOTPSlot index={1} />
                                                            <InputOTPSlot index={2} />
                                                            <InputOTPSlot index={3} />
                                                            <InputOTPSlot index={4} />
                                                            <InputOTPSlot index={5} />
                                                        </InputOTPGroup>
                                                    </InputOTP>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <div className="relative">
                                                    <FormControl>
                                                        <Input type={showPassword ? "text" : "password"} {...field} />
                                                    </FormControl>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-0 top-0 h-full px-3"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <div className="relative">
                                                    <FormControl>
                                                        <Input type={showConfirmPassword ? "text" : "password"} {...field} />
                                                    </FormControl>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-0 top-0 h-full px-3"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isLoading ? "Updating..." : "Reset Password"}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            )
        }

