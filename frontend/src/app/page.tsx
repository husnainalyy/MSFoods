import Features from "./Component/Features";
import Newsletter from "./Component/Newsletter";
import Footer from "./Component/Footer";
import Contact from "./Component/Contact";
import ProductGrid from "./Component/OurProducts";
import Benefit from "./Component/Features";
import HeroSection from "./Component/HeroSection";
import Message from "./Component/Message";
import Catergories from "./Component/Categories";   

export default function Home() {
    return (
        <>  
            <HeroSection  />
            <Benefit />
            <ProductGrid/>
            <Message/>
            <Catergories/>
            <Contact/>
            <Newsletter />
            <Footer/>
        </>
    );
}
