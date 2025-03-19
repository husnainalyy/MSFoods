import Image from "next/image";

interface Hero115Props {
    icon?: React.ReactNode;
    heading: string;
    description: string;
    trustText?: string;
    imageSrc?: string;
    imageAlt?: string;
}

const HeroSection = ({
    heading = "Premium Spices & Dry Foods for Every Kitchen",
    description = "Discover the finest selection of hand-picked spices and dry foods, sourced naturally and crafted for superior taste. Elevate your cooking with our premium ingredients.",
    trustText = "Trusted by 10,000+ Chefs & Home Cooks Worldwide",
    imageAlt = "Premium Spices and Dry Foods",
}: Hero115Props) => {
    return (
        <section className="overflow-hidden pt-4  bg-[#FAF0E6]">
            <div className="container">
                <div className="flex flex-col gap-5">
                    <div className="relative flex flex-col gap-5">
                        <div
                            style={{
                                transform: "translate(-50%, -50%)",
                            }}
                            className="absolute left-1/2 top-1/2 -z-10 mx-auto size-[800px] rounded-full border p-16 [mask-image:linear-gradient(to_top,transparent,transparent,black,black,black,transparent,transparent)] md:size-[1300px] md:p-32"
                        >
                            <div className="size-full rounded-full border p-16 md:p-32">
                                <div className="size-full rounded-full border"></div>
                            </div>
                        </div>
                        {/* <span className="mx-auto flex size-16 items-center justify-center rounded-full border md:size-20">
                            {icon}
                        </span> */}
                        <h2 className="mx-auto max-w-screen-lg text-[#800020] text-balance text-center text-3xl font-medium md:text-6xl">
                            {heading}
                        </h2>
                        <p className="mx-auto max-w-screen-md text-center text-muted-foreground md:text-lg">
                            {description}
                        </p>
                        <div className="flex flex-col items-center justify-center gap-3 pb-12 pt-3">

                            {trustText && (
                                <div className="text-xs text-[#B8860B] text-muted-foreground">{trustText}</div>
                            )}
                        </div>
                    </div>
                    <Image
                        src="/mb1.jpeg"
                        alt={imageAlt}
                        width={1024}
                        height={524}
                        className="mx-auto h-full max-h-[524px] w-full max-w-screen-lg rounded-2xl object-cover"
                    />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
