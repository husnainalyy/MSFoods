import AllProducts from "../Component/AllProducts";
import Footer from "../Component/Footer";
import ProductGrid from "../Component/OurProducts";

export default function Home() {
    return (
        <div className="bg-light">  
            <AllProducts/>
            <Footer/>
        </div>
    );
}
