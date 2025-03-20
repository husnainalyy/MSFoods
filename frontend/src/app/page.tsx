import Newsletter from "./Component/Newsletter";
import Footer from "./Component/Footer";
import Contact from "./Component/Contact";
import ProductGrid from "./Component/OurProducts";
import HeroSection from "./Component/HeroSection";
import Message from "./Component/Message";
import Categories from "./Component/Categories";
import LifestyleCategories from "./Component/Lifestyle";
import ReviewsSection from "./Component/Reviews";

export default function Home() {
    return (
        <div className="bg-light">  
            <HeroSection  />
            <ProductGrid/>
            <Message />
            <Categories/>
            <LifestyleCategories/>
            <ReviewsSection/>
            <Contact/>
            <Newsletter  />     
            <Footer/>
        </div>
    );
}
