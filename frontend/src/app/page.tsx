import HeroSection from "./Component/HeroSection";
import Features from "./Component/Features";
import Newsletter from "./Component/Newsletter";
import Footer from "./Component/Footer";
import Contact from "./Component/Contact";
import ProductGrid from "./Component/OurProducts";
<<<<<<< Updated upstream

export default function Home() {
    return (
        <>  
            <HeroSection />
            <Features/>
            <ProductGrid/>
=======
import Benefit from "./Component/Features";
import HeroSection from "./Component/HeroSection";
import Message from "./Component/Message";
import Catergories from "./Component/Categories";   

export default function Home() {
    return (
        <div className="bg-light">  
            <HeroSection  />
            <Benefit className="md:py-20 py-10" />
            <ProductGrid/>
            <Message/>
            <Catergories/>
>>>>>>> Stashed changes
            <Contact/>
            <Newsletter />
            <Footer/>
        </>
    );
}
