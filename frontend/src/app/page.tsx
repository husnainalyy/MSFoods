import Newsletter from "./Component/Newsletter";
import Footer from "./Component/Footer";
import Contact from "./Component/Contact";
import ProductGrid from "./Component/OurProducts";
import Benefit from "./Component/Features";
import HeroSection from "./Component/HeroSection";

export default function Home() {
    return (
        <div className="bg-[#FAF0E6]">  
            <HeroSection  />
            <Benefit className="md:py-20 py-10" />
            <ProductGrid/>
            <Contact/>
            <Newsletter  />
            <Footer/>
        </div>
    );
}
