import Newsletter from "./Component/Newsletter";
import Footer from "./Component/Footer";
import Contact from "./Component/Contact";
import ProductGrid from "./Component/OurProducts";
import Benefit from "./Component/Features";
import HeroSection from "./Component/HeroSection";
import Message from "./Component/Message";
import Categories from "./Component/Categories";

export default function Home() {
    return (
        <div className="bg-light">  
            <HeroSection  />
            <Benefit className="md:py-20 py-10" />
            <ProductGrid/>
            <Message />
            <Categories/>
            <Contact/>
            <Newsletter  />
            <Footer/>
        </div>
    );
}
