import HeroSection from "./Component/HeroSection";
import Features from "./Component/Features";
import Newsletter from "./Component/Newsletter";
import Footer from "./Component/Footer";
import Contact from "./Component/Contact";
import ProductGrid from "./Component/OurProducts";

export default function Home() {
    return (
        <>  
            <HeroSection />
            <Features/>
            <ProductGrid/>
            <Contact/>
            <Newsletter />
            <Footer/>
        </>
    );
}
