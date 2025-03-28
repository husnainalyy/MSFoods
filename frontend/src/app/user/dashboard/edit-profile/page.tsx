"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, MapPin, Plus, Trash2, AlertCircle, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useUser } from "../../../Component/user-context"
import Cookies from "js-cookie"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

interface Address {
  _id?: string
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
  addresses: Address[]
}

export default function EditProfilePage() {
  const { user, login } = useUser()
  const [userDetails, setUserDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [newAddress, setNewAddress] = useState<Address>({
    street: "",
    city: "",
    postalCode: "",
    country: "",
    isDefault: false,
  })
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const router = useRouter()

  useEffect(() => {
  fetchUserDetails()
}, [])


  // Update the fetchUserDetails function to use the token from the user object
  const fetchUserDetails = async () => {
    try {
      setIsLoading(true)
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
        throw new Error("Failed to fetch user details")
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (userDetails) {
      setUserDetails({
        ...userDetails,
        [name]: value,
      })
    }
  }

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAddress({
      ...newAddress,
      [name]: value,
    })
  }

  const handleEditAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (editingAddress) {
      setEditingAddress({
        ...editingAddress,
        [name]: value,
      })
    }
  }

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value,
    })
  }

  // Update the handleSaveProfile function to handle token refresh
  const handleSaveProfile = async () => {
    if (!userDetails) return

    try {
      setIsSaving(true)
      const token = user?.accessToken || localStorage.getItem("accessToken") || Cookies.get("accessToken")

      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name: userDetails.name,
          email: userDetails.email,
          phone: userDetails.phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile")
      }

      // Check if new tokens were returned (happens when email is changed)
      if (data.data && data.data.accessToken) {
        // Update the user in context with new token
        login(
          {
            ...user!,
            accessToken: data.data.accessToken,
            name: userDetails.name,
            email: userDetails.email,
          },
          {
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken || "",
          },
        )
      } else if (user && userDetails.name !== user.name) {
        // Just update the name if it changed
        login({
          ...user,
          name: userDetails.name,
        })
      }

      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Update the handleAddAddress function to use the token from the user object
  const handleAddAddress = async () => {
    try {
      setIsSaving(true)
      const token = user?.accessToken || localStorage.getItem("accessToken") || Cookies.get("accessToken")

      const response = await fetch(`${API_URL}/api/users/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(newAddress),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to add address")
      }

      // Refresh user data to get the updated addresses
      await fetchUserDetails()

      // Reset form and close dialog
      setNewAddress({
        street: "",
        city: "",
        postalCode: "",
        country: "",
        isDefault: false,
      })
      setShowAddressDialog(false)

      toast({
        title: "Success",
        description: "Address added successfully.",
      })
    } catch (error) {
      console.error("Error adding address:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add address. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Update the handleUpdateAddress function to use the token from the user object
  const handleUpdateAddress = async () => {
    if (!editingAddress || !editingAddressId) return

    try {
      setIsSaving(true)
      const token = user?.accessToken || localStorage.getItem("accessToken") || Cookies.get("accessToken")

      const response = await fetch(`${API_URL}/api/users/addresses/${editingAddressId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(editingAddress),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update address")
      }

      // Refresh user data to get the updated addresses
      await fetchUserDetails()

      // Reset form and close dialog
      setEditingAddress(null)
      setEditingAddressId(null)
      setShowAddressDialog(false)

      toast({
        title: "Success",
        description: "Address updated successfully.",
      })
    } catch (error) {
      console.error("Error updating address:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update address. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Update the handleDeleteAddress function to use the token from the user object
  const handleDeleteAddress = async (addressId: string) => {
    try {
      setIsSaving(true)
      const token = user?.accessToken || localStorage.getItem("accessToken") || Cookies.get("accessToken")

      const response = await fetch(`${API_URL}/api/users/addresses/${addressId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete address")
      }

      // Refresh user data to get the updated addresses
      await fetchUserDetails()

      toast({
        title: "Success",
        description: "Address deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting address:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete address. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Update the handleChangePassword function to handle token refresh
  const handleChangePassword = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const token = user?.accessToken || localStorage.getItem("accessToken") || Cookies.get("accessToken")

      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password")
      }

      // Check if new tokens were returned
      if (data.data && data.data.accessToken) {
        // Update the user in context with new token
        login(
          {
            ...user!,
            accessToken: data.data.accessToken,
          },
          {
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken || "",
          },
        )
      }

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast({
        title: "Success",
        description: "Your password has been changed successfully.",
      })
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to change your password. Please check your current password and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setEditingAddressId(address._id || null)
    setShowAddressDialog(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </TabsList>
          <div className="mt-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </Tabs>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <Button onClick={() => router.push("/user/dashboard")} variant="outline">
          Back to Profile
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="flex">
                  <div className="bg-gray-100 p-2 flex items-center justify-center rounded-l-md">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <Input
                    id="name"
                    name="name"
                    value={userDetails.name}
                    onChange={handleInputChange}
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex">
                  <div className="bg-gray-100 p-2 flex items-center justify-center rounded-l-md">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={userDetails.email || ""}
                    onChange={handleInputChange}
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex">
                  <div className="bg-gray-100 p-2 flex items-center justify-center rounded-l-md">
                    <Phone className="h-5 w-5 text-gray-500" />
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    value={userDetails.phone || ""}
                    onChange={handleInputChange}
                    className="rounded-l-none"
                    placeholder="+1234567890"
                  />
                </div>
                <p className="text-xs text-gray-500">Format: +[country code][number], e.g., +12345678901</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-black hover:bg-gray-800 text-white">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Manage Addresses</CardTitle>
                <CardDescription>Add, edit or remove your shipping addresses</CardDescription>
              </div>
              <Button
                onClick={() => {
                  setEditingAddress(null)
                  setEditingAddressId(null)
                  setNewAddress({
                    street: "",
                    city: "",
                    postalCode: "",
                    country: "",
                    isDefault: false,
                  })
                  setShowAddressDialog(true)
                }}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </CardHeader>
            <CardContent>
              {userDetails.addresses && userDetails.addresses.length > 0 ? (
                <div className="space-y-4">
                  {userDetails.addresses.map((address, index) => (
                    <div
                      key={address._id || index}
                      className={`p-4 rounded-lg border ${address.isDefault ? "border-black bg-gray-50" : "border-gray-200"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium">{userDetails.name}</p>
                              {address.isDefault && (
                                <span className="ml-2 text-xs bg-black text-white px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600">{address.street}</p>
                            <p className="text-gray-600">
                              {address.city}, {address.postalCode}
                            </p>
                            <p className="text-gray-600">{address.country}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditAddress(address)}>
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            onClick={() => address._id && handleDeleteAddress(address._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">No addresses yet</h3>
                  <p className="text-gray-500 mb-4">Add your first shipping address</p>
                  <Button
                    onClick={() => {
                      setEditingAddress(null)
                      setEditingAddressId(null)
                      setShowAddressDialog(true)
                    }}
                    variant="outline"
                  >
                    Add Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="flex">
                  <div className="bg-gray-100 p-2 flex items-center justify-center rounded-l-md">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="flex">
                  <div className="bg-gray-100 p-2 flex items-center justify-center rounded-l-md">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="flex">
                  <div className="bg-gray-100 p-2 flex items-center justify-center rounded-l-md">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleChangePassword}
                disabled={
                  isSaving ||
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword
                }
                className="bg-black hover:bg-gray-800 text-white"
              >
                {isSaving ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
            <DialogDescription>
              {editingAddress
                ? "Update your shipping address details below"
                : "Fill in the details for your new shipping address"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                name="street"
                value={editingAddress ? editingAddress.street : newAddress.street}
                onChange={editingAddress ? handleEditAddressInputChange : handleAddressInputChange}
                placeholder="123 Main St, Apt 4B"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={editingAddress ? editingAddress.city : newAddress.city}
                  onChange={editingAddress ? handleEditAddressInputChange : handleAddressInputChange}
                  placeholder="New York"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={editingAddress ? editingAddress.postalCode : newAddress.postalCode}
                  onChange={editingAddress ? handleEditAddressInputChange : handleAddressInputChange}
                  placeholder="10001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={editingAddress ? editingAddress.country : newAddress.country}
                onChange={editingAddress ? handleEditAddressInputChange : handleAddressInputChange}
                placeholder="United States"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isDefault"
                checked={editingAddress ? editingAddress.isDefault : newAddress.isDefault}
                onCheckedChange={(checked) => {
                  if (editingAddress) {
                    setEditingAddress({
                      ...editingAddress,
                      isDefault: checked as boolean,
                    })
                  } else {
                    setNewAddress({
                      ...newAddress,
                      isDefault: checked as boolean,
                    })
                  }
                }}
              />
              <Label htmlFor="isDefault" className="text-sm font-normal">
                Set as default address
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddressDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
              disabled={isSaving}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {isSaving
                ? editingAddress
                  ? "Updating..."
                  : "Adding..."
                : editingAddress
                  ? "Update Address"
                  : "Add Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

