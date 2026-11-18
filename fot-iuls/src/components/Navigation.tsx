
import "./Navbar.css";
import ProfileSelector from "../components/ProfileSelector";

interface NavigationProps {
    onEditProfile: () => void;
    name: string;
}

function Navigation({ onEditProfile, name }: NavigationProps) {
    return (
        <nav className="navbar">

            <div className="navbar-logo">
                <h2>IULMS</h2>
            </div>

            <div className="navbar-links">
            <a href="/">Home</a>
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#contact">Contact</a>
                <a href="/">Home</a>
                <a href="#about">About</a>
                <a href="#features">Features</a>
                <a href="#contact">Contact</a>
            </div>

            <div className="navbar-buttons">
                <ProfileSelector
                    name={name}
                    onClick={onEditProfile}
                />
            </div>

        </nav>
    );
}

export default Navigation;
