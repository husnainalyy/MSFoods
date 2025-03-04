import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    // Get the pathname of the request
    const path = request.nextUrl.pathname

    // Check if it's an admin route
    if (path.startsWith("/admin")) {
        const token = request.cookies.get("accessToken")?.value

        if (!token) {
            return NextResponse.redirect(new URL("/auth/login", request.url))
        }

        try {
            // Verify admin role from user data in localStorage
            const user = JSON.parse(localStorage.getItem("user") || "{}")
            if (user.role !== "admin") {
                return NextResponse.redirect(new URL("/", request.url))
            }
        } catch  {
            return NextResponse.redirect(new URL("/auth/login", request.url))
        }
    }

    return NextResponse.next()
}

// Configure the paths that should be matched by the middleware
export const config = {
    matcher: "/admin/:path*",
}

