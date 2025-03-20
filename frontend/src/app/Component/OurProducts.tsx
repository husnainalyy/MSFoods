<<<<<<< Updated upstream
"use client"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
=======
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
>>>>>>> Stashed changes

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.peachflask.com";

<<<<<<< Updated upstream
interface Product {
    _id: string
    name: string
    description: string
    price: number
    stock: number
    sizes: string[]
    categories: string[]
    images: { public_id: string; url: string }[]
    slug: string
}

export default function ProductGrid() {
    const [products, setProducts] = useState<Product[]>([])
    const [visibleProducts, setVisibleProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
=======
interface PriceOption {
  type: "packet" | "weight-based";
  weight: number;
  price: number;
  salePrice?: number | null;
}

interface Product {
  _id: string;
  name: string;
  priceOptions: PriceOption[];
  images: { public_id: string; url: string }[];
  slug: string;
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
>>>>>>> Stashed changes

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      setProducts(data.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< Updated upstream
    const loadMoreProducts = () => {
        const currentLength = visibleProducts.length
        const newProducts = products.slice(currentLength, currentLength + productsPerLoad)
        setVisibleProducts([...visibleProducts, ...newProducts])
    }

    if (isLoading) {
        return <LoadingState />
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>
    }

    if (products.length === 0) {
        return <NoProducts />
    }
=======
  const handleBuyNow = (product: Product) => {
    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart`,
    });
  };
>>>>>>> Stashed changes

  if (isLoading) {
    return (
<<<<<<< Updated upstream
        <main className="flex  flex-col items-center justify-between px-4">
            <div className="pb-10">
                <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {visibleProducts.map((product) => (
                        <Card key={product._id} className="flex flex-col">
                            <CardHeader>
                                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                                    <Image
                                        src={product.images[0]?.url || "/placeholder.svg"}
                                        alt={product.name}
                                        width={900}
                                        height={900}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardTitle className="mb-2">{product.name}</CardTitle>
                                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                            </CardContent>
                            <CardFooter className="flex flex-col md:flex-row justify-between items-center">
                                <span className="font-bold">Rs {product.price.toFixed(2)}</span>
                                <Link href={`/user/productDetail/${product._id}`}>
                                    <Button className="bg-[#9ACA3C] hover:bg-[#3A3A3A]" size="sm">
                                        View Details
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                {visibleProducts.length < products.length && (
                    <div className="mt-8 text-center">
                        <Button className="hover:bg-[#9ACA3C] bg-[#3A3A3A]" onClick={loadMoreProducts}>Load More</Button>
                    </div>
                )}
            </div>
        </main>
    )
}

function LoadingState() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
                <div className="flex justify-between items-center mb-8">
                    <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-white overflow-hidden flex flex-col p-4 rounded-lg shadow-sm">
                            <div className="aspect-square bg-gray-300 rounded-lg mb-4"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-300 rounded w-full"></div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                                <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}



function NoProducts() {
    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <h2 className="text-2xl font-bold mb-4">No Products Available</h2>
                <p className="text-gray-600 mb-8">Check back later for more products!</p>
                <motion.div
                    initial={{ y: -10 }}
                    animate={{ y: 10 }}
                    transition={{
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 1,
                    }}
                >
                    <Image src="/noproduct.svg" alt="No Products"  height={100} width={100} className="w-64 h-64 mx-auto" />
                </motion.div>
            </motion.div>
        </div>
    )
=======
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">No Products Available</h2>
        <p className="text-black">Check back later for more products!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Top picks for you</h2>
        <Link href="/products" className="text-sm underline">
          View all products
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const sortedPrices = product.priceOptions.sort((a, b) => a.price - b.price);
          const lowestPriceOption = sortedPrices[0];
          const displayPrice = lowestPriceOption?.salePrice || lowestPriceOption?.price;

          return (
            <div key={product._id} className="border border-gray-200 rounded-lg overflow-hidden group">
              <Link href={`/products/${product.slug}`}>
                <div className="aspect-square relative ">
                  <Image
                    src={product.images[0]?.url || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                  />
                </div>

                <div className="p-5">
                  <div className="text-[14px] text-[#1D1D1D]">
                    {product.priceOptions.length>1 ? "From " :""}{displayPrice ? `Rs. ${displayPrice.toFixed(2)}` : "Price not available"}
                  </div>
                  <div className="relative group">
                  <h3 className="font-semibold text-[17px] md:text-2xl md:font-bold mt-1 relative after:content-[''] after:block after:w-full after:h-[2px] after:bg-black after:scale-x-0 after:transition-transform after:duration-300 after:origin-left group-hover:after:scale-x-100">{product.name}</h3>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-3 rounded-full border-black hover:bg-black hover:text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      handleBuyNow(product);
                    }}
                  >
                    Buy now
                  </Button>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
>>>>>>> Stashed changes
}
