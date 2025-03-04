"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.peachflask.com"

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
        <div className="bg-gray-50 py-16">
            <div className="container mx-auto px-6 lg:px-12">
                <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
                    Contact <span className="text-[#9ACA3C]">Us</span>
                </h2>

                <div className="flex flex-col md:flex-row justify-center items-start gap-12">
                    {/* Contact Info */}
                    <div className="w-full md:w-1/3 space-y-6">
                        <h3 className="text-2xl font-semibold text-gray-700">Get in Touch</h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-white shadow-md rounded-lg">
                                <MapPin className="text-[#9ACA3C] w-6 h-6" />
                                <div>
                                    <h4 className="font-medium text-gray-700">Address</h4>
                                    <p className="text-gray-500">Plot No 9R-116 Opposite G.P.O Circular Road Kasur</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-white shadow-md rounded-lg">
                                <Phone className="text-[#9ACA3C] w-6 h-6" />
                                <div>
                                    <h4 className="font-medium text-gray-700">Phone</h4>
                                    <p className="text-gray-500">+92 3027801806</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-white shadow-md rounded-lg">
                                <Mail className="text-[#9ACA3C] w-6 h-6" />
                                <div>
                                    <h4 className="font-medium text-gray-700">Email</h4>
                                    <p className="text-gray-500">peachflask988@gmail.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="w-full md:w-2/3 bg-white shadow-lg p-8 rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your Name"
                                    required
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9ACA3C] transition"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Your Email"
                                    required
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9ACA3C] transition"
                                />
                            </div>

                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Subject"
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9ACA3C] transition"
                            />

                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Your Message"
                                rows={6}
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9ACA3C] transition"
                            ></textarea>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition ${isLoading
                                        ? "bg-[#9ACA3C] opacity-75 cursor-not-allowed"
                                        : "bg-[#9ACA3C] hover:bg-[#85b32b]"
                                    }`}
                            >
                                {isLoading ? "Sending..." : "Send Message"}
                                <Send size={18} />
                            </button>

                            {/* Status Message */}
                            {statusMessage && (
                                <p className="text-center font-medium mt-2">{statusMessage}</p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
