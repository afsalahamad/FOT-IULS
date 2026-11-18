import "./Navbar.css";

function Navigation(){
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
            </div>

            <div className="navbar-buttons">
            <a href="/login" className="login-btn">Login</a>
            <a href="/register" className="register-btn">Sign Up</a>
            </div>
        </nav>
    );
}

export default Navigation;