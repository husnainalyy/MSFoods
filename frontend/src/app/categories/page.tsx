import Categories from "../Component/Categories";
import Footer from "../Component/Footer";
import Newsletter from "@/app/Component/Newsletter";
import Header from "@/app/Component/Header";

export default function Home() {
    return (
        <div className="bg-light">  
            <Header/>
            <Categories/>
            <Footer/>
        </div>
    );
}
