import { Facebook, Twitter, Youtube, Instagram } from "lucide-react"
import Link from "next/link"

export default function Footer() {
    return (
        <footer className="bg-[#3A3A3A] text-gray-300">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About Us Column */}
                    <div>
                        <h3 className="text-white text-xl mb-4" style={{ fontFamily: '"Josefin Slab", serif' }}>
                            About Us
                        </h3>
                        <p className="text-gray-400 mb-4">
                            At Peach Flask, we craft stylish, durable, and eco-friendly bottles designed to keep your drinks fresh and your adventures endless.
                        </p>
                        <div className="flex gap-4">
                            <Link href="https://www.facebook.com/share/18X5tYBEtW/?mibextid=wwXIfr" className="hover:text-white transition-colors">
                                <Facebook size={20} />
                            </Link>
                            <Link href="https://www.instagram.com/peach.flask?igsh=MXFtYXV3bzNkaHF1" className="hover:text-white transition-colors">
                                <Instagram size={20} />
                            </Link>
                            <Link href="#" className="hover:text-white transition-colors">
                                <Twitter size={20} />
                            </Link>
                            <Link href="#" className="hover:text-white transition-colors">
                                <Youtube size={20} />
                            </Link>
                        </div>
                    </div>

                    {/* Information Column */}
                    <div>
                        <h3 className="text-white text-xl mb-4" style={{ fontFamily: '"Josefin Slab", serif' }}>
                            Information
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="#" className="hover:text-white transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-white transition-colors">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-white transition-colors">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-white transition-colors">
                                    Contact
                                </Link>
                            </li>
                            
                        </ul>
                    </div>

                    {/* Account Column */}
                    <div>
                        <h3 className="text-white text-xl mb-4" style={{ fontFamily: '"Josefin Slab", serif' }}>
                            Account
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/user/myOrders" className="hover:text-white transition-colors">
                                    My orders
                                </Link>
                            </li>
                            <li>
                                <Link href="/user/cart" className="hover:text-white transition-colors">
                                    My cart
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-white transition-colors">
                                    My addresses
                                </Link>
                            </li>
                            <li>
                                <Link href="/user/about" className="hover:text-white transition-colors">
                                    About us
                                </Link>
                            </li>
                            <li>
                                <Link href="/user/contact" className="hover:text-white transition-colors">
                                    contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                   
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="border-t border-gray-700 py-4">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm">
                    <div>© 2019 Peach Flask. All right Reserved. Designed by <Link href="https://www.husnaindev.tech/">husnaindev</Link> </div>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link href="/" className="hover:text-white transition-colors">
                            Home
                        </Link>
                        <Link href="/contact" className="hover:text-white transition-colors">
                            Contact Us
                        </Link>
                        <Link href="/about" className="hover:text-white transition-colors">
                            About Us
                        </Link>
                        
                    </div>
                </div>
            </div>
        </footer>
    )
}

