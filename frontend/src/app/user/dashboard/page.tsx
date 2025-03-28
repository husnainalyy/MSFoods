"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Package,
  CreditCard,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { useUser } from "../../Component/user-context"
import Cookies from "js-cookie"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

interface Address {
  _id: string
  street: string
  city: string
  postalCode: string
  country: string
  isDefault: boolean
}

interface UserData {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  isVerified: boolean
  createdAt: string
  addresses: Address[]
  orderCount?: number
  totalSpent?: number
}

export default function ProfilePage() {
  const { user } = useUser()
  const [userDetails, setUserDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  useEffect(() => {
    fetchUserDetails()
  }, [])

  // Update the fetchUserDetails function to use the token from the user object
  const fetchUserDetails = async () => {
    try {
      setIsLoading(true)
      console.log("Stored token:", user?.accessToken)
      console.log("LocalStorage token:", localStorage.getItem("accessToken"))
      console.log("Cookies token:", Cookies.get("accessToken"))
      const token = user?.accessToken || localStorage.getItem("accessToken") || Cookies.get("accessToken")

      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user details")
      }

      const data = await response.json()

      // Your API returns data in a nested structure
      if (data.success && data.data) {
        setUserDetails(data.data)
      } else {
        throw new Error(data.message || "Failed to fetch user details")
      }
    } catch (error) {
      console.error("Error fetching user details:", error)
      toast({
        title: "Error",
        description: "Failed to load your profile details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <Skeleton className="h-24 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
          <div className="md:w-2/3 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!userDetails) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Unable to load profile</h3>
          <p className="text-gray-600 mb-4">We couldn't load your profile information.</p>
          <Button onClick={fetchUserDetails}>Try Again</Button>
        </div>
      </div>
    )
  }

  const defaultAddress = userDetails.addresses?.find((addr) => addr.isDefault) || userDetails.addresses?.[0]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Button
          onClick={() => router.push("/user/dashboard/edit-profile")}
          className="bg-black hover:bg-gray-800 text-white"
        >
          Edit Profile
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Summary Card */}
        <div className="md:w-1/3">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle>Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Update the profile summary section to handle the absence of isVerified field */}
              <div className="flex justify-center">
                <div className="relative h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                  {userDetails.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold">{userDetails.name}</h3>
                <p className="text-gray-500">{userDetails.role === "admin" ? "Administrator" : "Customer"}</p>
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{userDetails.email || "No email provided"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{userDetails.phone || "No phone provided"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Member since {formatDate(userDetails.createdAt)}</span>
                </div>
              </div>

              <div className="pt-2">
                <Badge variant={userDetails.isVerified ? "default" : "outline"} className="w-full justify-center py-1">
                  {userDetails.isVerified ? "Verified Account" : "Unverified Account"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:w-2/3 space-y-6">
          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Orders</p>
                      <p className="text-2xl font-bold">{userDetails.orderCount || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full mr-4">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Spent</p>
                      <p className="text-2xl font-bold">Rs. {userDetails.totalSpent?.toFixed(2) || "0.00"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Default Address */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Default Address</CardTitle>
                <CardDescription>Your primary shipping address</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push("/user/dashboard/edit-profile#addresses")}>
                Manage Addresses
              </Button>
            </CardHeader>
            <CardContent>
              {defaultAddress ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium">{userDetails.name}</p>
                      <p className="text-gray-600">{defaultAddress.street}</p>
                      <p className="text-gray-600">
                        {defaultAddress.city}, {defaultAddress.postalCode}
                      </p>
                      <p className="text-gray-600">{defaultAddress.country}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">No address added yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/user/dashboard/edit-profile#addresses")}
                  >
                    Add Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-gray-500">You have a strong password</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/user/dashboard/edit-profile#password")}
                  >
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Email Verification</p>
                      <p className="text-sm text-gray-500">
                        {userDetails.isVerified ? "Your email is verified" : "Your email is not verified"}
                      </p>
                    </div>
                  </div>
                  {!userDetails.isVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Verification email sent",
                          description: "Please check your inbox for the verification link.",
                        })
                      }}
                    >
                      Verify Email
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

