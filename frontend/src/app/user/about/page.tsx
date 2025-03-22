import Image from "next/image"
import Link from "next/link"
import { Instagram, Check, History, Leaf, Globe, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Footer from "@/app/Component/Footer"
import Header from "@/app/Component/Header"
import Newsletter from "@/app/Component/Newsletter"

export default function AboutUs() {
    return (
        <>
           
            <div className="bg-white">
                {/* Header */}
                <section className="container py-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">About MS Foods</h1>
                    <p className="text-xl text-gray-800 max-w-3xl mx-auto">
                        Your trusted source for premium spices, dry fruits, and natural ingredients since 2015.
                    </p>
                    <Separator className="my-8 max-w-md mx-auto bg-blue-100" />
                </section>

                {/* Overview Section */}
                <section className=" ">
                    <div className="container">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6">A Legacy of Purity and Taste</h2>
                                <p className="text-gray-700 mb-4">
                                    Welcome to MS Foods, where our journey is rooted in a passion for pure, high-quality flavors that bring
                                    warmth and authenticity to every meal.
                                </p>
                                <p className="text-gray-700">
                                    From the very beginning, our philosophy has been simple—"Pure Ingredients, Pure Taste." We take pride in
                                    offering only the best, ensuring that every product delivers the highest standard of quality and taste.
                                </p>
                            </div>
                            <div className="relative h-[300px] rounded-lg overflow-hidden border border-gray-200">
                                <Image
                                    src="/mb1.jpeg"
                                    alt="MS Foods premium products"
                                    fill
                                    className="object-cover   "
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="container py-16">
                    <h2 className="text-3xl font-bold text-center mb-12">Our Commitment</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="border-gray-200 hover:shadow-md transition-shadow duration-300">
                            <CardContent className="pt-6">
                                <div className="mb-4 flex justify-center">
                                    <div className="p-3 rounded-full bg-green-50">
                                        <Check className="h-8 w-8 text-green-600" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-center mb-3 text-gray-900">Premium Quality</h3>
                                <p className="text-gray-700 text-center">
                                    We carefully source our spices and dry fruits from the best farms and suppliers, ensuring freshness,
                                    purity, and nutritional value.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200 hover:shadow-md transition-shadow duration-300">
                            <CardContent className="pt-6">
                                <div className="mb-4 flex justify-center">
                                    <div className="p-3 rounded-full bg-purple-50">
                                        <Leaf className="h-8 w-8 text-purple-600" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-center mb-3 text-gray-900">Natural Ingredients</h3>
                                <p className="text-gray-700 text-center">
                                    Our dedication to quality means that every product we offer is free from additives and
                                    preservatives—just nature's goodness, as it should be.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200 hover:shadow-md transition-shadow duration-300">
                            <CardContent className="pt-6">
                                <div className="mb-4 flex justify-center">
                                    <div className="p-3 rounded-full bg-amber-50">
                                        <Heart className="h-8 w-8 text-amber-600" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-center mb-3 text-gray-900">Authentic Taste</h3>
                                <p className="text-gray-700 text-center">
                                    We believe in delivering authentic flavors that enhance your culinary experiences while supporting a
                                    healthier lifestyle.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* History Section */}
                <section className="bg-amber-50 py-16">
                    <div className="container">
                        <div className="flex flex-col md:flex-row gap-12">
                            <div className="md:w-1/3 flex justify-center">
                                <div className="p-4 rounded-full bg-white shadow-md inline-flex">
                                    <History className="h-16 w-16 text-amber-700" />
                                </div>
                            </div>
                            <div className="md:w-2/3">
                                <h2 className="text-3xl font-bold mb-6 text-gray-900">How It All Began</h2>
                                <p className="text-gray-700 mb-4">
                                    Our story began with a simple yet powerful idea: to provide families with premium spices and dry fruits
                                    that elevate everyday cooking. Founded in 2015, MS Foods started as a small business driven by a love
                                    for rich flavors and natural ingredients.
                                </p>
                                <p className="text-gray-700">
                                    What began as a local endeavor quickly grew into a brand recognized for its authenticity and excellence.
                                    Our journey has been guided by our commitment to quality and the trust of our valued customers.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Vision Section */}
                <section className="container py-16">
                    <h2 className="text-3xl font-bold text-center mb-12">Looking to the Future</h2>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="bg-blue-50 p-8 rounded-lg hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center mb-6">
                                <Globe className="h-8 w-8 text-blue-600 mr-4" />
                                <h3 className="text-xl font-semibold text-gray-900">Sustainability</h3>
                            </div>
                            <p className="text-gray-700">
                                We are committed to sustainable practices, ethical sourcing, and forming partnerships with farmers and
                                suppliers who share our values.
                            </p>
                        </div>

                        <div className="bg-green-50 p-8 rounded-lg hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center mb-6">
                                <Leaf className="h-8 w-8 text-green-600 mr-4" />
                                <h3 className="text-xl font-semibold text-gray-900">Innovation</h3>
                            </div>
                            <p className="text-gray-700">
                                Our future is about expanding our reach, introducing new flavors, and continuing to deliver products that
                                enhance your culinary experiences.
                            </p>
                        </div>
                    </div>
                </section>

               
                <Newsletter/>
            </div>
           
        </>
    )
}

