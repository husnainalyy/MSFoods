import React from "react";
import { Headphones, PackageCheck, ShieldCheck, Truck } from "lucide-react";

interface Props {
    className?: string;
}

const benefits = [
    {
        icon: <Headphones className="w-12 h-12 text-[#800020]" />,
        title: "24/7 Customer Service",
        description: "We're here to help you with any questions or related concerns you have, 24/7.",
    },
    {
        icon: <PackageCheck className="w-12 h-12 text-[#800020]" />,
        title: "14-Day Money Back",
        description: "If you're not satisfied with your purchase, simply return it within 14 days for a refund.",
    },
    {
        icon: <ShieldCheck className="w-12 h-12 text-[#800020]" />,
        title: "Our Guarantee",
        description: "We stand behind our products and services and guarantee your satisfaction.",
    },
    {
        icon: <Truck className="w-12 h-12 text-[#800020]" />,
        title: "Shipping Worldwide",
        description: "We ship our products worldwide, making them accessible to customers everywhere.",
    },
];

const Benefit: React.FC<Props> = ({ className }) => {
    return (
        <div className={`container   ${className}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                {benefits.map((benefit, index) => (
                    <div key={index} className="flex flex-col items-center space-y-4 ">
                        {benefit.icon}
                        <h3 className="text-lg font-semibold text-[#B8860B]">{benefit.title}</h3>
                        <p className="text-[#333333] max-w-xs">{benefit.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Benefit;
