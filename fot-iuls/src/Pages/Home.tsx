import Navigation from '../components/Navigation';
import LibraryTabs from '../components/Pages/Home/LibraryTabs';
import Footer from '../components/Footer';

import Book from '../components/Pages/Home/Books';
import Banner from '../components/Pages/Home/HeroBanner';

interface HomeProps {
    profileName?: string;
}

function Home({ profileName }: HomeProps) {
    return (
        <div>
            {/* Navigation Bar */}
            <Navigation profileName={profileName} />

            {/* Hero Banner */}
            <Banner />

            {/* Books Section */}
            <Book />

            {/* Library Tabs */}
            <main id="library">
                <LibraryTabs />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}

export default Home;