"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Loader } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

export default function VerifyEmailPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { token } = useParams();

    const [hasMounted, setHasMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (!hasMounted) return;
        if (!token) {
            toast({
                variant: "destructive",
                title: "Verification Error",
                description: "Missing verification token",
            });
            setLoading(false);
            return;
        }
        const verifyEmail = async () => {
            try {
                const response = await fetch(`${API_URL}/api/auth/verify-email/${token}`);
                const data = await response.json();
                if (!response.ok){
                    toast({
                        title: "Error",
                        description: "Verification failed" + data.message,
                        variant: "destructive",
                    })
                }

                setSuccess(true);
                toast({ title: "Email Verified Successfully" });
                setTimeout(() => router.push("/auth/login"), 3000);
            } catch (error: unknown) {
                toast({
                    variant: "destructive",
                    title: "Verification Error",
                    description: error instanceof Error ? error.message : "An error occurred",
                });
            } finally {
                setLoading(false);
            }
        };
        verifyEmail();
    }, [hasMounted, token, router, toast]);

    if (!hasMounted) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md p-4">
                {loading ? (
                    <div className="flex items-center justify-center">
                        <Loader className="animate-spin h-8 w-8 text-gray-500" />
                        <span className="ml-2 text-gray-500">Verifying...</span>
                    </div>
                ) : success ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Email Verified</h2>
                        <p className="text-gray-600">Redirecting to login page...</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Verification Failed</h2>
                        <p className="text-gray-600">Please try again later.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
