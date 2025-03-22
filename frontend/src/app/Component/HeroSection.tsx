import Image from "next/image";

interface HeroSectionProps {
    desktopImageSrc?: string;
    mobileImageSrc?: string;
    imageAlt?: string;
}

const HeroSection = ({
    // desktopImageSrc = "/hero.webp",
    desktopImageSrc = "/mb1.jpeg",
    mobileImageSrc = "/mb1.jpeg",
    imageAlt = "Premium Spices and Dry Foods",
}: HeroSectionProps) => {
    return (
        <section className="w-full h-screen relative mb-20">
            {/* Desktop Image */}
            <div className="hidden sm:block w-full ">
                <Image
                    src={desktopImageSrc}
                    alt={imageAlt}
                    width={900}
                    height={900}
                    className="absolute inset-0 w-full h-full "
                />
            </div>

            {/* Mobile Image */}
            <div className="block sm:hidden w-full ">
                <Image
                    src={mobileImageSrc}
                    alt={imageAlt}
                    width={900}
                    height={900}
                    className="absolute inset-0 w-full h-full "
                />
            </div>
        </section>
    );
};

export default HeroSection;
