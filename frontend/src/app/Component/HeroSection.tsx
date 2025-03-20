import Image from "next/image";

interface HeroSectionProps {
    desktopImageSrc?: string;
    mobileImageSrc?: string;
    imageAlt?: string;
}

const HeroSection = ({
    desktopImageSrc = "/hero.webp",
    mobileImageSrc = "/mobilehero.webp",
    imageAlt = "Premium Spices and Dry Foods",
}: HeroSectionProps) => {
    return (
        <section className="w-full h-screen relative">
            {/* Desktop Image */}
            <div className="hidden sm:block w-full h-full">
                <Image
                    src={desktopImageSrc}
                    alt={imageAlt}
                    layout="fill"
                    objectFit="cover"
                    className="absolute inset-0"
                />
            </div>

            {/* Mobile Image */}
            <div className="block sm:hidden w-full h-full">
                <Image
                    src={mobileImageSrc}
                    alt={imageAlt}
                    layout="fill"
                    objectFit="cover"
                    className="absolute inset-0"
                />
            </div>
        </section>
    );
};

export default HeroSection;
