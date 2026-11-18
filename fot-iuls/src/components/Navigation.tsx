
import { useEffect, useRef, useState } from "react";
import "./Navbar.css";
import ProfileSelector from "./ProfileSelector";

function Navigation(){

interface NavigationProps {
    profileName?: string;
}

function Navigation({ profileName = "Guest" }: NavigationProps) {
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const closeMenu = (event: MouseEvent) => {
            if (!profileRef.current?.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", closeMenu);
        return () => document.removeEventListener("mousedown", closeMenu);
    }, []);


    return (
        <nav className="navbar" aria-label="Main navigation">
            <a href="#home" className="navbar-logo" aria-label="IULMS home">
                <h2>IULMS</h2>
            </a>

            <div className="navbar-links">
                <a href="#home">Home</a>
                <a href="#library">Library</a>
                <a href="#community">Community</a>
                <a href="#research">Research</a>
            </div>

            <div className="navbar-actions">
                <div className="navbar-buttons">
                    <a href="#login" className="login-btn">Login</a>
                    <a href="#signup" className="register-btn">Sign Up</a>
                </div>

                <div className="profile-menu" ref={profileRef}>
                    <ProfileSelector
                        name={profileName}
                        onClick={() => setProfileOpen((open) => !open)}
                    />
                    {profileOpen && (
                        <div className="profile-dropdown" role="menu">
                            <a href="#edit-profile" role="menuitem" onClick={() => setProfileOpen(false)}>
                                Edit Profile
                            </a>
                            <a href="#login" role="menuitem" onClick={() => setProfileOpen(false)}>
                                Sign In
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navigation;