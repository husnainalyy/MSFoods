'use client';

import { useState } from "react";
import { Send } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.peachflask.com";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMessage("");

        try {
            const response = await fetch(`${API_URL}/api/send-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatusMessage("✅ Message sent successfully!");
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                setStatusMessage("❌ Error sending message. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            setStatusMessage("❌ Network error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="py-16 px-4 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between gap-16">
                {/* Left Section - Contact Form */}
                <div className="lg:w-2/3">
                    <h2 className="text-4xl font-bold text-[#800020]">Drop Us A Line</h2>
                    <p className="mt-3 text-[#B8860B]">Use the form below to get in touch with the sales team</p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Your Name *"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />

                            <input
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Your Email *"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <input
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                            id="subject"
                            name="subject"
                            type="text"
                            placeholder="Subject *"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                        />

                        <textarea
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                            id="message"
                            name="message"
                            rows={5}
                            placeholder="Your Message *"
                            value={formData.message}
                            onChange={handleChange}
                            required
                        />

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "SENDING..." : "SEND MESSAGE"}
                                <Send size={18} />
                            </button>
                        </div>

                        {statusMessage && (
                            <p className="text-center font-medium mt-2">{statusMessage}</p>
                        )}
                    </form>
                </div>

                {/* Right Section - Contact Details */}
                <div className="lg:w-1/3 space-y-12">
                    <div>
                        <h3 className="text-2xl font-bold text-[#800020]">Our Store</h3>
                        <p className="mt-3 text-gray-700">
                            Plot No 9R-116 Opposite G.P.O Circular Road Kasur
                        </p>
                        <p className="mt-3 text-gray-700">
                            Phone: <span className="whitespace-nowrap">+92 3027801806</span>
                        </p>
                        <p className="mt-1 text-gray-700">
                            Email: <span className="whitespace-nowrap">peachflask988@gmail.com</span>
                        </p>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-[#800020]">Open Hours</h3>
                        <p className="mt-3 text-gray-700">
                            Mon - Fri: <span className="whitespace-nowrap">7:30am - 8:00pm PST</span>
                        </p>
                        <p className="mt-3 text-gray-700">
                            Saturday: <span className="whitespace-nowrap">8:00am - 6:00pm PST</span>
                        </p>
                        <p className="mt-3 text-gray-700">
                            Sunday: <span className="whitespace-nowrap">9:00am - 5:00pm PST</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}