import Footer from "../Component/Footer";
import Header from "../Component/Header";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="">
            <Header/>
            {children}
            <Footer/>
        </div>
    );
}