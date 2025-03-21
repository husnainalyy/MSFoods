import Footer from "../Component/Footer";
import ReviewsSection from "../Component/Reviews";
import Header from "@/app/Component/Header";
import Newsletter from "@/app/Component/Newsletter";

export default function Home() {
    return (
        <div className="bg-light">  
            <Header/>
            <ReviewsSection/>
            <Footer/>
        </div>
    );
}
