import Footer from "../../Component/Footer";
import CategoryProducts from "@/app/Component/CategoryProducts";
import Header from "@/app/Component/Header";
import Newsletter from "@/app/Component/Newsletter";
export default function Home() {
    return (
        <div className="bg-light">  
            <Header/>
            <CategoryProducts/>
            <Newsletter/>
            <Footer/>
        </div>
    );
}
