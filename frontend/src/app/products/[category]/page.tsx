import Footer from "../../Component/Footer";
import CategoryProducts from "@/app/Component/CategoryProducts";

export default function Home() {
    return (
        <div className="bg-light">  
            <CategoryProducts/>
            <Footer/>
        </div>
    );
}
