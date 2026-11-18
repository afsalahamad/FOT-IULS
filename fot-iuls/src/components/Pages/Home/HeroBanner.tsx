import './HeroBanner.css';
import heroArtwork from '../../../assets/hero-banner.png';

function HeroBanner() {
    return (
        <section className="hero-banner">

            {/* Background Artwork */}
            <div className="hero-image">
                <img
                    src={heroArtwork}
                    alt="Digital globe and a collection of books"
                />
            </div>

            {/* Banner Content */}
            <div className="hero-content">

                <h1>
                    Knowledge
                    <br />
                    beyond boundaries
                </h1>

                <p>
                    Access books, research and ideas from our global
                    academic community.
                </p>

                {/* Banner Buttons */}
                <div className="hero-buttons">

                    <a
                        href="#featured-books"
                        className="explore-btn"
                    >
                        Explore Library
                        <span>→</span>
                    </a>

                    <a
                        href="/login"
                        className="signin-btn"
                    >
                        Sign In
                    </a>

                </div>

            </div>

        </section>
    );
}

export default HeroBanner;