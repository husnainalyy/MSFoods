import Footer from "../Component/Footer";
import Newsletter from "../Component/Newsletter";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="">
            
            {children}
            <Newsletter/>
            <Footer/>
        </div>
    );
}