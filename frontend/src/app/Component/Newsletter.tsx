export default function Newsletter() {
    return (
        <div className="bg-[#9ACA3C] py-8">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
                <h2 className="text-white text-3xl mb-4 md:mb-0" style={{ fontFamily: '"Josefin Slab", serif' }}>
                    Our NewsLetter
                </h2>
                <div className="flex-1 max-w-2xl ml-0 md:ml-8">
                    <form className="flex gap-4">
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="flex-1 px-4 py-2 rounded-sm focus:outline-none"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-white text-[#9ACA3C] px-6 py-2 font-medium hover:bg-opacity-90 transition-colors rounded-sm"
                        >
                            SUBSCRIBE
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

