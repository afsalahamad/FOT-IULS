import Navigation from '../components/Navigation';
import LibraryTabs from "../components/Pages/Home/LibraryTabs";
import Footer from '../components/Footer';

interface HomeProps {
    profileName?: string;
}

function Home({ profileName }: HomeProps) {
    return (
        <div>
            <Navigation profileName={profileName} />
            <main id="library">
                <LibraryTabs />
            </main>
            <Footer />
        </div>
    );
}

export default Home;