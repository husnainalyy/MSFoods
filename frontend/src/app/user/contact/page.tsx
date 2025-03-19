"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, ChevronRight, Send } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    })
        const { toast } = useToast()
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prevData) => ({ ...prevData, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const response = await fetch(`${API_URL}/api/send-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Email sent successfully",
                })
                setFormData({ name: "", email: "", subject: "", message: "" })
            } else {
                toast({
                    title: "Error",
                    description: "Error sending email",
                    variant: "destructive",
                })
            }
        } catch (error:unknown) {
            toast({
                title: "Error",
                description: "Error sending email:" + (error instanceof Error ? error.message : String(error)),
                variant: "destructive",
            })
        }
    }

    const faqs = [
        {
            question: "What are your shipping rates?",
            answer:
                "Our shipping rates vary depending on the destination and the size of the order. You can view the exact shipping cost at checkout before completing your purchase.",
        },
        {
            question: "How long does shipping take?",
            answer:
                "Shipping times depend on your location. Typically, domestic orders are delivered within 3-5 business days, while international orders may take 7-14 business days.",
        },
        {
            question: "Do you support COD payments?",
            answer: "Yes, we offer Cash on Delivery (COD) in select regions. You can check availability at checkout."
        },
        {
            question: "What are the payment methods?",
            answer: "We accept various payment methods, including credit/debit cards, jazz cash, and Cash on Delivery (where available)."
        },
        {
            question: "What is your return policy?",
            answer:
                "We offer a 30-day return policy for most items. If you're not satisfied with your purchase, you can return it for a full refund or exchange within 30 days of delivery.",
        },
        {
            question: "Do you offer international shipping?",
            answer:
                "Yes, we ship to many countries worldwide. You can see if we ship to your country during the checkout process.",
        },
    ]

    return (
        <div className="min-h-screen bg-white text-gray-800">
            <div
                className="h-[40vh] bg-cover bg-center relative"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/80">
                    <div className="h-full max-w-7xl mx-auto px-4 flex flex-col justify-center">
                        <div className="max-w-3xl">
                            <div className="flex items-center space-x-2 text-sm text-gray-300 mb-6">
                                <span>Home</span>
                                <ChevronRight size={16} />
                                <span>Contact</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
                                Contact Us
                            </h1>
                            <p className="text-xl text-gray-300 leading-relaxed">
                                We are here to help. Get in touch with us for any inquiries or support.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200"
                    >
                        <div className="p-8">
                            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Send Us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Name
                                    </label>
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Email
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject
                                    </label>
                                    <Input
                                        id="subject"
                                        type="text"
                                        name="subject"
                                        placeholder="How can we help you?"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Message
                                    </label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        placeholder="Please provide details about your inquiry..."
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        className="min-h-[150px] border-gray-300 focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                <div className="text-center">
                                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                                        <Send className="mr-2 h-4 w-4" /> Send Message
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="space-y-8"
                    >
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Company Information</h2>
                            <div className="space-y-3">
                                <p className="flex items-center text-gray-600">
                                    <Mail className="mr-2 text-green-600" size={18} />
                                    peachflask988@gmail.com
                                </p>
                                <p className="flex items-center text-gray-600">
                                    <Phone className="mr-2 text-green-600" size={18} />
                                    +92 3027801806
                                </p>
                                <p className="flex items-center text-gray-600">
                                    <MapPin className="mr-2 text-green-600" size={18} />
                                    Plot No 9R-116 Opposite G.P.O Circular Road Kasur
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Customer Support Hours</h2>
                            <div className="space-y-3">
                                <p className="flex items-center text-gray-600">
                                    <Clock className="mr-2 text-green-600" size={18} />
                                    Monday - Friday: 9:00 AM - 6:00 PM EST
                                </p>
                                <p className="flex items-center text-gray-600">
                                    <Clock className="mr-2 text-green-600" size={18} />
                                    Saturday: 10:00 AM - 4:00 PM EST
                                </p>
                                <p className="flex items-center text-gray-600">
                                    <Clock className="mr-2 text-green-600" size={18} />
                                    Sunday: Closed
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Connect With Us</h2>
                            <div className="flex space-x-4">
                                <a
                                    href="https://www.facebook.com/share/18X5tYBEtW/?mibextid=wwXIfr"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-green-600 transition-colors"
                                >
                                    <Facebook size={24} />
                                </a>

                                <a
                                    href="https://www.instagram.com/peach.flask?igsh=MXFtYXV3bzNkaHF1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-green-600 transition-colors"
                                >
                                    <Instagram size={24} />
                                </a>

                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mb-16"
                >
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">Frequently Asked Questions</h2>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
                                <AccordionTrigger className="text-gray-800 hover:text-green-600">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>



                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                >
                   
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">Our Location</h2>
                    <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg border border-gray-200">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3415.791171159536!2d74.44117308051187!3d31.11553570839889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3919b99c9cc1179d%3A0xe6a26f6500eceab6!2sCircular%20Rd%2C%20Kasur%2C%20Pakistan!5e0!3m2!1sen!2s!4v1740403292620!5m2!1sen!2s"
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 mt-16"
                >
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Commitment to Quality</h2>
                        <p className="text-gray-600">
                            At Peach Flask, we are dedicated to delivering the highest quality products and services. We meticulously select our materials, partner with trusted suppliers, and rigorously test each bottle to ensure exceptional durability and performance. Our commitment to excellence means that every Peach Flask you receive meets the highest standards of style, function, and sustainability.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Sustainability Initiatives</h2>
                        <p className="text-gray-600">
                            Sustainability is at the core of everything we do. We use eco-friendly packaging, collaborate with environmentally conscious suppliers, and take steps to reduce our carbon footprint. By choosing Peach Flask, you are not just investing in a premium hydration experience— you are also supporting a greener, more sustainable future. 🍑💧🌍
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

