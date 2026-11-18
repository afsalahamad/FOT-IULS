
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Book from '../components/Pages/Home/Books';
import Banner from '../components/Pages/Home/HeroBanner';

function Home() {
    return (
        <div>
            <Navigation />
            < Banner />
            <Book />

            <Footer />

        </div>
    );
}

export default Home;
