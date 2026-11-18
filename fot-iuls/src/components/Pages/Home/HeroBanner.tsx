import './HeroBanner.css';
import heroArtwork from '../../../assets/hero-banner.png';

interface HeroBannerProps {
  onExplore?: () => void;
}

function HeroBanner({ onExplore }: HeroBannerProps) {
    const handleExploreClick = (e: React.MouseEvent) => {
        if (onExplore) {
            e.preventDefault();
            onExplore();
        }
    };

    return (
        <section className="hero-banner">
            {/* Background Artwork */}
            <div className="hero-image">
                <img
                    src={heroArtwork}
                    alt="Digital globe and a collection of academic volumes"
                />
            </div>

            {/* Banner Content */}
            <div className="hero-content">
                <span className="hero-tagline">Intelligent University Library System</span>
                <h1>
                    Knowledge
                    <br />
                    beyond boundaries
                </h1>

                <p>
                    Access curriculum textbooks, peer-reviewed research, and AI-assisted summaries from across the global academic community.
                </p>

                {/* Banner Buttons */}
                <div className="hero-buttons">
                    <a
                        href="#library"
                        className="explore-btn"
                        onClick={handleExploreClick}
                    >
                        Explore Library
                        <span>→</span>
                    </a>

                    <a
                        href="#login"
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
