import Image from "next/image"
import { ChevronRight, Users, Trophy, Rocket, Heart } from "lucide-react"

export default function AboutPage() {
    const values = [
        {
            icon: <Users className="h-6 w-6 text-blue-600" />,
            title: "Customer First",
            description: "We prioritize our customers in every decision we make, ensuring their success and satisfaction.",
        },
        {
            icon: <Trophy className="h-6 w-6 text-yellow-500" />,
            title: "Excellence",
            description: "We maintain the highest standards in our products, services, and customer interactions.",
        },
        {
            icon: <Rocket className="h-6 w-6 text-blue-600" />,
            title: "Innovation",
            description: "We continuously push boundaries to create better solutions for tomorrow's challenges.",
        },
        {
            icon: <Heart className="h-6 w-6 text-yellow-500" />,
            title: "Passion",
            description: "Our dedication to excellence drives everything we do, from product design to customer service.",
        },
    ]

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div
                className="h-[60vh] bg-cover bg-center relative"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/80">
                    <div className="h-full max-w-7xl mx-auto px-4 flex flex-col justify-center">
                        <div className="max-w-3xl">
                            <div className="flex items-center space-x-2 text-sm text-gray-300 mb-6">
                                <span>Home</span>
                                <ChevronRight size={16} />
                                <span>About</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
                                Transforming Hydration with Innovation
                            </h1>
                            <p className="text-xl text-gray-300 leading-relaxed">
                                At Peach Flask, we believe that staying hydrated should be both stylish and sustainable. Our mission is to craft premium-quality, eco-friendly bottles designed for everyday adventures—whether you are at the gym, the office, or exploring the great outdoors.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Introduction */}
                <section className="px-4 py-24 bg-gray-50">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-xl  leading-relaxed">
                            Founded in 2010, our journey began with a simple vision: to redefine hydration and online shopping through innovation, sustainability, and exceptional service. What started as a small operation has now evolved into a global brand, trusted by customers worldwide for quality, design, and durability.

                            We are committed to creating a better future—one bottle at a time. 🌍💧🍑
                        </p>
                    </div>
                </section>

                {/* CEO Message */}
                <section className="px-4 py-8 md:py-24 bg-gray-50">
                    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1">
                            <div className="space-y-8">
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    At Peach Flask, we believe that hydration should be both stylish and sustainable. Our mission is to craft premium-quality, eco-friendly bottles designed for everyday adventures—whether you are at the gym, the office, or exploring the great outdoors.

                                  
                                </p>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Made from high-grade, BPA-free materials, our bottles keep your drinks at the perfect temperature for hours, ensuring freshness with every sip. We are committed to sustainability, durability, and innovation, offering designs that blend function with aesthetics.
                                    <br />

                                    Join us in making hydration effortless, eco-conscious, and stylish—one Peach Flask at a time. 🍑💧

                                </p>
                               
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <div className="aspect-[4/5] relative rounded-lg overflow-hidden shadow-2xl">
                                <Image
                                    src="/dall1.png"
                                    alt="Our CEO"
                                    layout="fill"
                                    objectFit="cover"
                                    className="transform transition-transform duration-500 hover:scale-105"
                                />
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Values */}
                <section className=" md:py-16 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
                            Our Core Values
                        </h2>
                        <div className="flex flex-wrap justify-center gap-8">
                            {values.map((value, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-start w-full sm:w-80"
                                >
                                    <div className="p-3 rounded-full bg-indigo-100 mb-4">
                                        {value.icon}
                                    </div>
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                                        {value.title}
                                    </h3>
                                    <p className="text-gray-600">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mission */}
                <section className="px-4 pb-24 bg-gray-50">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            At Peach Flask, our mission is to redefine hydration by creating stylish, durable, and eco-friendly bottles that seamlessly fit into everyday life. We are committed to sustainability, using high-quality, BPA-free materials to reduce plastic waste and promote a greener future. Through continuous innovation, we design bottles that not only keep your drinks fresh but also complement your lifestyle. Customer satisfaction is at the heart of everything we do, ensuring every sip is refreshing and every purchase is worthwhile. With Peach Flask, hydration becomes more than just a habit—it’s a step towards a healthier, more sustainable world.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    )
}

