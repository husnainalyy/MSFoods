import Image from "next/image";
import Link from "next/link";
import { Send, Facebook, Instagram, Youtube } from "lucide-react";

export default function OurStory() {
  return (
    <div className="container mb-20 px-4 md:px-6">

      {/* Page Title */}
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Our Story</h1>

      {/* Main Image */}
      <div className="mb-6 md:mb-8">
        <Image 
          src="/face.avif"
          alt="MS Foods Founder" 
          width={475} 
          height={475}
          className="w-full max-w-md mx-auto"
        />
      </div>

      {/* Main Content */}
      <div className="space-y-6 md:space-y-8">
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">A Legacy of Purity and Taste</h2>
          <p className="text-sm md:text-base text-gray-700">
            Welcome to MS Foods, your trusted source for premium spices, dry fruits, and natural ingredients. Our journey is rooted in a passion for pure, high-quality flavors that bring warmth and authenticity to every meal.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Our Commitment to Quality</h2>
          <p className="text-sm md:text-base text-gray-700">
            At MS Foods, we believe that great taste begins with the finest ingredients. We carefully source our spices and dry fruits from the best farms and suppliers, ensuring freshness, purity, and nutritional value. Our dedication to quality means that every product we offer is free from additives and preservatives—just nature’s goodness, as it should be.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">How It All Began</h2>
          <p className="text-sm md:text-base text-gray-700">
            Our story began with a simple yet powerful idea: to provide families with premium spices and dry fruits that elevate everyday cooking. Founded in 2015, MS Foods started as a small business driven by a love for rich flavors and natural ingredients. What began as a local endeavor quickly grew into a brand recognized for its authenticity and excellence.
          </p>
          <p className="text-sm md:text-base text-gray-700 mt-3 md:mt-4">
            From the very beginning, our philosophy has been simple—"Pure Ingredients, Pure Taste." We take pride in offering only the best, ensuring that every product delivers the highest standard of quality and taste.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Looking to the Future</h2>
          <p className="text-sm md:text-base text-gray-700">
            As we continue our journey, our mission remains the same: to bring you the best in spices, dry fruits, and natural food essentials. We are committed to sustainability, ethical sourcing, and maintaining the trust of our valued customers.
          </p>
          <p className="text-sm md:text-base text-gray-700 mt-3 md:mt-4">
            Our future is about expanding our reach, introducing new flavors, and forming partnerships with farmers and suppliers who share our values. We aim to keep delivering products that enhance your culinary experiences while supporting a healthier lifestyle.
          </p>
          <p className="text-sm md:text-base text-gray-700 mt-3 md:mt-4">
            Thank you for being part of the MS Foods family. Together, we celebrate the art of cooking with pure, flavorful, and wholesome ingredients.
          </p>
          <p className="text-sm md:text-base text-gray-700 mt-3 md:mt-4">
            Stay connected with us for updates, recipes, and more! Follow us on <Link href="https://instagram.com/msfoods" className="text-primary hover:underline">Instagram</Link> @msfoods.
          </p>
        </section>
      </div>
    </div>
  );
}
