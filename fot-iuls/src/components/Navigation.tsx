import { useEffect, useRef, useState } from "react";
import "./Navbar.css";
import ProfileSelector from "./ProfileSelector";
import { useAuth } from "../context/useAuth";
import logoTransparent from "../assets/logo-transparent.png";

interface NavigationProps {
    profileName?: string;
}

function Navigation({ profileName }: NavigationProps) {
    const { isAuthenticated, isAdmin, displayName, signOut } = useAuth();
    const effectiveName = profileName && profileName !== "Guest" ? profileName : displayName;

    const [profileOpen, setProfileOpen] = useState(false);
    const [currentHash, setCurrentHash] = useState(() => window.location.hash || '#home');
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentHash(window.location.hash || '#home');
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

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

    const handleNavClick = (targetHash: string, e: React.MouseEvent<HTMLAnchorElement>) => {
        if (targetHash === '#home' && (window.location.hash === '#home' || !window.location.hash)) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSignOut = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setProfileOpen(false);
        await signOut();
        window.location.hash = '#home';
    };

    return (
        <nav className="navbar" aria-label="Main navigation">
            <a
                href="#home"
                className="navbar-logo"
                aria-label="IULS home"
                onClick={(e) => handleNavClick('#home', e)}
            >
                <img src={logoTransparent} alt="IULS Logo" className="navbar-logo-img" />
                <div className="navbar-logo-text">
                    <h2>IULS</h2>
                    <span className="logo-sub">Academic Library</span>
                </div>
            </a>

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

            <div className="navbar-actions">
                {!isAuthenticated && (
                    <div className="navbar-buttons">
                        <a href="#login" className="login-btn">Login</a>
                        <a href="#signup" className="register-btn">Sign Up</a>
                    </div>
                )}

                <div className="profile-menu" ref={profileRef}>
                    <ProfileSelector
                        name={effectiveName}
                        onClick={() => setProfileOpen((open) => !open)}
                    />

                    {profileOpen && (
                        <div className="profile-dropdown" role="menu">
                            {isAuthenticated && (
                                <a
                                    href="#edit-profile"
                                    role="menuitem"
                                    onClick={() => setProfileOpen(false)}
                                >
                                    Edit Profile
                                </a>
                            )}

                            <a
                                href="#student-dashboard"
                                role="menuitem"
                                onClick={() => setProfileOpen(false)}
                            >
                                Student Dashboard
                            </a>

                            {isAdmin && (
                                <a
                                    href="#admin"
                                    role="menuitem"
                                    onClick={() => setProfileOpen(false)}
                                >
                                    Admin Dashboard
                                </a>
                            )}

                            {isAuthenticated ? (
                                <a
                                    href="#home"
                                    role="menuitem"
                                    className="dropdown-signout"
                                    onClick={(e) => void handleSignOut(e)}
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
