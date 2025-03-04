import { Truck, CreditCard, Headphones } from "lucide-react"

export default function Features() {
    return (
        <div className="bg-white py-12 border-t flex justify-center items-center w-full  ">
            <div className="  px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    <div className="flex items-center gap-4 py-8 md:py-0 md:px-8 first:pt-0 md:first:pt-0 md:first:pl-0 last:pb-0 md:last:pr-0">
                        <Truck className="w-12 h-12 text-gray-400" />
                        <div>
                            <h3 className="text-xl font-medium" style={{ fontFamily: '"Josefin Slab", serif' }}>
                                Free shipping
                            </h3>
                            <p className="text-gray-500">On order over Rs 2500</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 py-8 md:py-0 md:px-8 first:pt-0 md:first:pt-0 md:first:pl-0 last:pb-0 md:last:pr-0">
                        <CreditCard className="w-12 h-12 text-gray-400" />
                        <div>
                            <h3 className="text-xl font-medium" style={{ fontFamily: '"Josefin Slab", serif' }}>
                                Safe payment
                            </h3>
                            <p className="text-gray-500">Easy payment</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 py-8 md:py-0 md:px-8 first:pt-0 md:first:pt-0 md:first:pl-0 last:pb-0 md:last:pr-0">
                        <Headphones className="w-12 h-12 text-gray-400" />
                        <div>
                            <h3 className="text-xl font-medium" style={{ fontFamily: '"Josefin Slab", serif' }}>
                                Support
                            </h3>
                            <p className="text-gray-500">Life time support 24/7</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

