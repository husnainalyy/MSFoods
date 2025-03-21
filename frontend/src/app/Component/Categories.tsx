"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.peachflask.com";

interface Category {
  _id: string;
  name: string;
  images: { public_id: string; url: string }[];
  slug: string;
}

// Pastel colors matching the image
const pastelColors = [
  "bg-[#FFE8B8] text-[#333333]", // Light Peach/Orange
  "bg-[#D8E8D5] text-[#333333]", // Light Green
  "bg-[#FFCCCB] text-[#333333]", // Light Pink
  "bg-[#E6E6FA] text-[#333333]", // Lavender
  "bg-[#B0E0E6] text-[#333333]", // Powder Blue
  "bg-[#F0E68C] text-[#333333]", // Khaki
];

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch categories");
      }

      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse text-lg">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">No Categories Available</h2>
        <p className="text-black">Check back later for more categories!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Categories</h2>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-6 justify-center">
  {categories.map((category, index) => {
    const bgColor = pastelColors[index % pastelColors.length];

    return (
      <div
        key={category._id}
        className="overflow-hidden rounded-2xl shadow-md transition-transform duration-300 ease-in-out hover:scale-102"
      >
        <Link href={`/products/${category.name}`} className="block">
          {/* Image container - takes up about 70% of the card height */}
          <div className="relative w-full aspect-[4/3]">
            <Image
              src={category.images[0]?.url || "/placeholder.svg"}
              alt={category.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Content container with colored background */}
          <div className={`${bgColor} p-6 flex flex-col items-center`}>
            <h3 className="font-bold text-4xl mb-4">{category.name}</h3>

            <Button
              variant="outline"
              className={`w-3/4 mt-3 rounded-full border-black hover:bg-black hover:text-white ${bgColor} py-3 text-lg`}
            >
              Show More
            </Button>
          </div>
        </Link>
      </div>
    );
  })}
</div>

    </div>
  );
}
