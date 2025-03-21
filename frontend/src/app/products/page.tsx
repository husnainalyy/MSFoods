import AllProducts from "../Component/AllProducts";
import Footer from "../Component/Footer";
import ProductGrid from "../Component/OurProducts";
import Header from "../Component/Header";
import Newsletter from "@/app/Component/Newsletter";


export default function Home() {
    return (
        <div className="bg-light">  
            <Header />
            <AllProducts/>
            <Newsletter/>
            <Footer/>
        </div>
    );
}
