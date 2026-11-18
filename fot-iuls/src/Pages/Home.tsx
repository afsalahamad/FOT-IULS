import Navigation from '../components/Navigation';
import LibraryTabs from "../components/Pages/Home/LibraryTabs";
import Footer from '../components/Footer';


function Home(){
    return (
        <div>
            <Navigation />
             <LibraryTabs />
            <Footer />
        </div>
    );
}

export default Home;