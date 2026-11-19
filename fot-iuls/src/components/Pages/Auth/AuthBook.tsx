import { useState } from 'react';
import './AuthBook.css';

import bookBackground from '../../../assets/book-background.png';
import iulsLogo from '../../../assets/logo-transparent.png';

function AuthBook() {

    const [isSignup, setIsSignup] = useState(false);

    // Flip to Signup
    const handleSignup = () => {
        setIsSignup(true);
    };

    // Flip back to Login
    const handleLogin = () => {
        setIsSignup(false);
    };

    // Prevent actual form submission for now
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    return (

        <div className="auth-container">

            {/* MAIN BOOK */}

            <div className="book-container">

                {/* BOOK BACKGROUND IMAGE */}

                <img
                    src={bookBackground}
                    alt="Open IULS Book"
                    className="book-artwork"
                />

                {/* 3D FLIPPING BOOK SPREAD */}

                <div className={`spread-flipper ${isSignup ? 'is-flipped' : ''}`}>

                    {/* =================================
                        FRONT SIDE - LOGIN
                    ================================= */}

                    <div className="spread-face spread-front">

                        {/* LEFT SIDE - IULS LOGO */}

                        <div className="brand-panel">

                            <img
                                src={iulsLogo}
                                alt="IULS University Logo"
                                className="iuls-logo"
                            />

                            <h3>
                                INTELLIGENT
                                <br />
                                UNIVERSITY
                                <br />
                                LIBRARY SYSTEM
                            </h3>

                            <p>
                                Discover. Read. Research. Connect.
                            </p>

                        </div>


                        {/* RIGHT SIDE - LOGIN FORM */}

                        <div className="form-panel">

                            <h2>Welcome Back</h2>

                            <p className="form-subtitle">
                                Login to your IULS account
                            </p>

                            <form onSubmit={handleSubmit}>

                                <input
                                    type="text"
                                    placeholder="Username"
                                    autoComplete="username"
                                    required
                                />

                                <input
                                    type="password"
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    required
                                />

                                <div className="login-options">

                                    <label>
                                        <input
                                            type="checkbox"
                                        />
                                        Remember me
                                    </label>

                                    <a href="/forgot-password">
                                        Forgot Password?
                                    </a>

                                </div>

                                <button
                                    type="submit"
                                    className="auth-button"
                                >
                                    Log In
                                </button>

                            </form>

                            <p className="switch-text">

                                Don't have an account?

                                <button
                                    type="button"
                                    onClick={handleSignup}
                                >
                                    Sign Up
                                </button>

                            </p>

                        </div>

                    </div>


                    {/* =================================
                        BACK SIDE - SIGNUP
                    ================================= */}

                    <div className="spread-face spread-back">

                        {/* LEFT SIDE - SIGNUP FORM */}

                        <div className="form-panel signup-panel">

                            <h2>Create Account</h2>

                            <p className="form-subtitle">
                                Sign up to join IULS
                            </p>

                            <form onSubmit={handleSubmit}>

                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    autoComplete="name"
                                    required
                                />

                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    autoComplete="email"
                                    required
                                />

                                <input
                                    type="password"
                                    placeholder="Password"
                                    autoComplete="new-password"
                                    required
                                />

                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="submit"
                                    className="auth-button"
                                >
                                    Sign Up
                                </button>

                            </form>

                            <p className="switch-text">

                                Already have an account?

                                <button
                                    type="button"
                                    onClick={handleLogin}
                                >
                                    Log In
                                </button>

                            </p>

                        </div>


                        {/* RIGHT SIDE - IULS LOGO */}

                        <div className="brand-panel">

                            <img
                                src={iulsLogo}
                                alt="IULS University Logo"
                                className="iuls-logo"
                            />

                            <h3>
                                INTELLIGENT
                                <br />
                                UNIVERSITY
                                <br />
                                LIBRARY SYSTEM
                            </h3>

                            <p>
                                Discover. Read. Research. Connect.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default AuthBook;