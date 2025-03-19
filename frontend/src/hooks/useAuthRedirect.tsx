import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthRedirect() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("accessToken"); // Get token from localStorage or cookies
        if (token) {
            router.push("/admin/dashboard"); // Redirect if token exists
        }
    }, [router]);
}
