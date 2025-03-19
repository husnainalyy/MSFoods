import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Facebook, Instagram, Twitter, Youtube, ChevronDown } from 'lucide-react';

const Footer = () => {
    return (
        <footer className='footer bg-surface py-12'>
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                        <Link href={'/'} className="text-2xl font-bold">MSFood</Link>
                        <div className='mt-4 space-y-2'>
                            <p className="text-sm">Mail: hi.avitex@gmail.com</p>
                            <p className="text-sm">Phone: 1-333-345-6868</p>
                            <p className="text-sm">Address: 549 Oak St. Crystal Lake, IL 60014</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-3">Information</h4>
                        <ul className="space-y-2">
                            <li><Link href={'/pages/contact'} className='text-sm hover:underline'>Contact us</Link></li>
                            <li><Link href={'#!'} className='text-sm hover:underline'>Career</Link></li>
                            <li><Link href={'/my-account'} className='text-sm hover:underline'>My Account</Link></li>
                            <li><Link href={'/order-tracking'} className='text-sm hover:underline'>Order & Returns</Link></li>
                            <li><Link href={'/pages/faqs'} className='text-sm hover:underline'>FAQs</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-3">Customer Services</h4>
                        <ul className="space-y-2">
                            <li><Link href={'/pages/faqs'} className='text-sm hover:underline'>Orders FAQs</Link></li>
                            <li><Link href={'/pages/faqs'} className='text-sm hover:underline'>Shipping</Link></li>
                            <li><Link href={'/pages/faqs'} className='text-sm hover:underline'>Privacy Policy</Link></li>
                            <li><Link href={'/order-tracking'} className='text-sm hover:underline'>Return & Refund</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-3">Newsletter</h4>
                        <p className="text-sm mb-3">Sign up for our newsletter and get 10% off your first purchase</p>
                        <form className='relative flex'>
                            <input type="email" placeholder='Enter your email' className='border border-gray-300 p-2 rounded-l w-full text-sm' required />
                            <button className='bg-black text-white p-2 rounded-r'><ArrowRight size={20} /></button>
                        </form>
                        <div className='flex gap-4 mt-4'>
                            <Link href={'https://www.facebook.com/'} target='_blank'><Facebook size={20} /></Link>
                            <Link href={'https://www.instagram.com/'} target='_blank'><Instagram size={20} /></Link>
                            <Link href={'https://www.twitter.com/'} target='_blank'><Twitter size={20} /></Link>
                            <Link href={'https://www.youtube.com/'} target='_blank'><Youtube size={20} /></Link>
                          
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-300 mt-8 pt-4 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm">©2023 MSFood. All Rights Reserved.</p>
                    <div className='flex gap-4 items-center'>
                        <select className='bg-transparent text-sm border border-gray-300 p-1 rounded'>
                            <option value="English">English</option>
                            <option value="Espana">Espana</option>
                            <option value="France">France</option>
                        </select>
                        <ChevronDown size={16} />
                        <select className='bg-transparent text-sm border border-gray-300 p-1 rounded'>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                        </select>
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
