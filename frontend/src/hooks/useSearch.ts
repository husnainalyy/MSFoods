import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

function debounce<T extends (arg: string) => unknown>(
    func: T,
    wait: number
): (arg: string) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null

    return (arg: string) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(arg), wait)
    }
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.peachflask.com"

export function useSearch() {
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce(async (term: string) => {
            if (term.trim() === "") {
                setSearchResults([])
                return
            }

            setIsLoading(true)
            try {
                const response = await fetch(`${API_URL}/api/products/search?q=${encodeURIComponent(term)}`)
                if (!response.ok) {
                    toast({
                        title: "Error",
                        description: "Search failed",
                        variant: "destructive",
                    })
                }
                const data = await response.json()
                setSearchResults(data.data)
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                toast({
                    title: "Error",
                    description: "Search error: " + errorMessage,
                    variant: "destructive",
                })
                setSearchResults([])
            } finally {
                setIsLoading(false)
            }
        }, 300),
        [toast],
    )

    useEffect(() => {
        debouncedSearch(searchTerm)
    }, [searchTerm, debouncedSearch])

    return { searchTerm, setSearchTerm, searchResults, isLoading }
}



