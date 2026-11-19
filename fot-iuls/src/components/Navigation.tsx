import { useEffect, useRef, useState } from "react";
import "./Navbar.css";
import ProfileSelector from "./ProfileSelector";

interface NavigationProps {
    profileName?: string;
}

function Navigation({ profileName = "Guest" }: NavigationProps) {
    const [profileOpen, setProfileOpen] = useState(false);
    const [currentHash, setCurrentHash] = useState(() => window.location.hash || '#home');
    const profileRef = useRef<HTMLDivElement>(null);

    // Sync active hash on hashchange
    useEffect(() => {
        const handleHashChange = () => {
            setCurrentHash(window.location.hash || '#home');
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const closeMenu = (event: MouseEvent) => {
            if (!profileRef.current?.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", closeMenu);
        return () => {
            document.removeEventListener("mousedown", closeMenu);
        };
    }, []);

    // Keep repeated clicks on Home useful by returning to the top.
    const handleNavClick = (targetHash: string, e: React.MouseEvent<HTMLAnchorElement>) => {
        if (targetHash === '#home' && (window.location.hash === '#home' || !window.location.hash)) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <nav className="navbar" aria-label="Main navigation">
            {/* Logo */}
            <a
                href="#home"
                className="navbar-logo"
                aria-label="IULS home"
                onClick={(e) => handleNavClick('#home', e)}
            >
                <h2>IULS</h2>
                <span className="logo-sub">Academic Library</span>
            </a>

            {/* Navigation Links with Active State */}
            <div className="navbar-links">
                <a
                    href="#home"
                    className={currentHash === '#home' || !currentHash ? 'active' : ''}
                    onClick={(e) => handleNavClick('#home', e)}
                >
                    Home
                </a>
                <a
                    href="#library"
                    className={currentHash.startsWith('#library') ? 'active' : ''}
                    onClick={(e) => handleNavClick('#library', e)}
                >
                    Library
                </a>
                <a
                    href="#community"
                    className={currentHash === '#community' ? 'active' : ''}
                >
                    Community
                </a>
                <a
                    href="#research"
                    className={currentHash.startsWith('#research') ? 'active' : ''}
                    onClick={(e) => handleNavClick('#research', e)}
                >
                    Research
                </a>
            </div>

            {/* Navigation Actions */}
            <div className="navbar-actions">
                {/* Only show Login / Sign Up if user is a Guest */}
                {profileName === "Guest" && (
                    <div className="navbar-buttons">
                        <a href="#login" className="login-btn">Login</a>
                        <a href="#signup" className="register-btn">Sign Up</a>
                    </div>
                )}

                {/* Profile Dropdown */}
                <div className="profile-menu" ref={profileRef}>
                    <ProfileSelector
                        name={profileName}
                        onClick={() => setProfileOpen((open) => !open)}
                    />

                    {profileOpen && (
                        <div className="profile-dropdown" role="menu">
                            <a
                                href="#edit-profile"
                                role="menuitem"
                                onClick={() => setProfileOpen(false)}
                            >
                                Edit Profile
                            </a>

                            {profileName === "Admin" ? (
                                <a
                                    href="#admin"
                                    role="menuitem"
                                    onClick={() => setProfileOpen(false)}
                                >
                                    Admin Dashboard
                                </a>
                            ) : (
                                <a
                                    href="#student-dashboard"
                                    role="menuitem"
                                    onClick={() => setProfileOpen(false)}
                                >
                                    Student Dashboard
                                </a>
                            )}

                            {profileName !== "Guest" ? (
                                <a
                                    href="#login"
                                    role="menuitem"
                                    className="dropdown-signout"
                                    onClick={() => setProfileOpen(false)}
                                >
                                    Sign Out
                                </a>
                            ) : (
                                <a
                                    href="#login"
                                    role="menuitem"
                                    onClick={() => setProfileOpen(false)}
                                >
                                    Sign In
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navigation;
