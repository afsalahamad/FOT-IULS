
import "./Navbar.css";

function Navigation(){
    return <div className="nav"></div>;
=======
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
>>>>>>> 054dd9389cbdee7390876782b4e8ebf6b283fb1c
}

export default Navigation;