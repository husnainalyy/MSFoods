// Utility functions for authentication

/**
 * Gets the JWT access token from localStorage
 * @returns The JWT token or null if not found
 */
export function getAccessToken(): string | null {
    if (typeof window !== "undefined") {
        return localStorage.getItem("accessToken")
    }
    return null
}

/**
 * Gets the JWT refresh token from localStorage
 * @returns The refresh token or null if not found
 */
export function getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
        return localStorage.getItem("refreshToken")
    }
    return null
}

/**
 * Creates headers with Authorization token for API requests
 * @param additionalHeaders - Optional additional headers to include
 * @returns Headers object with Authorization token
 */
export function createAuthHeaders(additionalHeaders: Record<string, string> = {}): HeadersInit {
    const token = getAccessToken()
    return {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
        ...additionalHeaders,
    }
}

/**
 * Makes an authenticated API request with automatic token refresh
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Promise with the fetch response
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = getAccessToken()

    // Set initial headers with access token
    const headers = {
        ...options.headers,
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
    }

    // Make the initial request
    const response = await fetch(url, {
        ...options,
        headers,
    })

    // If unauthorized, try to refresh the token
    if (response.status === 401) {
        const refreshToken = getRefreshToken()

        if (refreshToken) {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
                const refreshResponse = await fetch(`${API_URL}/api/auth/refresh-token`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken }),
                })

                if (refreshResponse.ok) {
                    const data = await refreshResponse.json()

                    // Store new tokens
                    localStorage.setItem("accessToken", data.data.accessToken)
                    localStorage.setItem("refreshToken", data.data.refreshToken)

                    // Retry the original request with new token
                    return fetch(url, {
                        ...options,
                        headers: {
                            ...options.headers,
                            Authorization: `Bearer ${data.data.accessToken}`,
                        },
                    })
                } else {
                    // If refresh fails, clear tokens and throw error
                    localStorage.removeItem("accessToken")
                    localStorage.removeItem("refreshToken")
                    localStorage.removeItem("user")
                    throw new Error("Session expired. Please login again.")
                }
            } catch (error) {
                // Clear tokens on error
                localStorage.removeItem("accessToken")
                localStorage.removeItem("refreshToken")
                localStorage.removeItem("user")
                throw error
            }
        } else {
            throw new Error("No refresh token available")
        }
    }

    return response
}

