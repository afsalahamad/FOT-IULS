
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Book from '../components/Pages/Home/Books';

interface HomeProps {
    profileName?: string;
}

function Home({ profileName }: HomeProps) {
    return (
        <div>
            <Navigation profileName={profileName} />

            <Book />

            <Footer />

        </div>
    );
}

export default Home;
