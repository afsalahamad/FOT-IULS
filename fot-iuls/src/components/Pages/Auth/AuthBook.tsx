import { useState } from 'react';
import './AuthBook.css';

import bookBackground from '../../../assets/book-background.png';
import iulsLogo from '../../../assets/logo-transparent.png';
import { useAuth } from '../../../context/useAuth';
import { supabase } from '../../../lib/supabase';

interface AuthBookProps {
    initialMode?: 'login' | 'signup';
}

function AuthBook({ initialMode = 'login' }: AuthBookProps) {
    const { signIn, signUp } = useAuth();
    const [prevMode, setPrevMode] = useState(initialMode);
    const [isSignup, setIsSignup] = useState(initialMode === 'signup');

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Signup state
    const [fullName, setFullName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    if (prevMode !== initialMode) {
        setPrevMode(initialMode);
        setIsSignup(initialMode === 'signup');
        setErrorMessage('');
        setStatusMessage('');
    }

    const handleSignupFlip = () => {
        setIsSignup(true);
        setErrorMessage('');
        setStatusMessage('');
    };

    const handleLoginFlip = () => {
        setIsSignup(false);
        setErrorMessage('');
        setStatusMessage('');
    };

    const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');
        setStatusMessage('');
        setSubmitting(true);

        const { error } = await signIn(loginEmail, loginPassword);
        setSubmitting(false);

        if (error) {
            setErrorMessage(error);
            return;
        }
        window.location.hash = '#home';
    };

    const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');
        setStatusMessage('');

        if (signupPassword.length < 6) {
            setErrorMessage('Password must be at least 6 characters long.');
            return;
        }
        if (signupPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        setSubmitting(true);
        const { error, needsEmailConfirmation } = await signUp({
            fullName,
            email: signupEmail,
            password: signupPassword,
        });
        setSubmitting(false);

        if (error) {
            setErrorMessage(error);
            return;
        }

        if (needsEmailConfirmation) {
            setStatusMessage('Account created. Check your email inbox to confirm your address before signing in.');
            setSignupPassword('');
            setConfirmPassword('');
            return;
        }

        window.location.hash = '#student-dashboard';
    };

    const handleForgotPassword = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setErrorMessage('');
        setStatusMessage('');
        if (!loginEmail.trim()) {
            setErrorMessage('Enter your account email first, then click Forgot Password.');
            return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(loginEmail.trim(), {
            redirectTo: `${window.location.origin}${window.location.pathname}#login`,
        });
        if (error) {
            setErrorMessage(error.message);
        } else {
            setStatusMessage('Password reset instructions have been sent to your email.');
        }
    };

    return (
        <div className="auth-container">
            <a href="#home" className="auth-back-btn" aria-label="Back to home page">
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span>Back to Home</span>
            </a>

            <div className="book-container">
                <img
                    src={bookBackground}
                    alt="Open IULS Book"
                    className="book-artwork"
                />

                <div className={`spread-flipper ${isSignup ? 'is-flipped' : ''}`}>
                    {/* FRONT SIDE - LOGIN */}
                    <div className="spread-face spread-front">
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
                            <p>Discover. Read. Research. Connect.</p>
                        </div>

                        <div className="form-panel">
                            <h2>Welcome Back</h2>
                            <p className="form-subtitle">Login to your IULS account</p>

                            {!isSignup && errorMessage && (
                                <p role="alert" style={{ color: '#dc2626', fontSize: '13px', margin: '0 0 10px' }}>
                                    {errorMessage}
                                </p>
                            )}
                            {!isSignup && statusMessage && (
                                <p role="status" style={{ color: '#047857', fontSize: '13px', margin: '0 0 10px' }}>
                                    {statusMessage}
                                </p>
                            )}

                            <form onSubmit={(e) => void handleLoginSubmit(e)}>
                                <input
                                    type="email"
                                    placeholder="University Email"
                                    autoComplete="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    required
                                />

                                <input
                                    type="password"
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                />

                                <div className="login-options">
                                    <label>
                                        <input type="checkbox" defaultChecked />
                                        Remember me
                                    </label>

                                    <a href="#login" onClick={(e) => void handleForgotPassword(e)}>
                                        Forgot Password?
                                    </a>
                                </div>

                                <button
                                    type="submit"
                                    className="auth-button"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Signing In...' : 'Log In'}
                                </button>
                            </form>

                            <p className="switch-text">
                                Don&apos;t have an account?
                                <button type="button" onClick={handleSignupFlip}>
                                    Sign Up
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* BACK SIDE - SIGNUP */}
                    <div className="spread-face spread-back">
                        <div className="form-panel signup-panel">
                            <h2>Create Account</h2>
                            <p className="form-subtitle">Sign up to join IULS</p>

                            {isSignup && errorMessage && (
                                <p role="alert" style={{ color: '#dc2626', fontSize: '13px', margin: '0 0 10px' }}>
                                    {errorMessage}
                                </p>
                            )}
                            {isSignup && statusMessage && (
                                <p role="status" style={{ color: '#047857', fontSize: '13px', margin: '0 0 10px' }}>
                                    {statusMessage}
                                </p>
                            )}

                            <form onSubmit={(e) => void handleSignupSubmit(e)}>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    autoComplete="name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />

                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    autoComplete="email"
                                    value={signupEmail}
                                    onChange={(e) => setSignupEmail(e.target.value)}
                                    required
                                />

                                <input
                                    type="password"
                                    placeholder="Password (min 6 chars)"
                                    autoComplete="new-password"
                                    value={signupPassword}
                                    onChange={(e) => setSignupPassword(e.target.value)}
                                    minLength={6}
                                    required
                                />

                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    minLength={6}
                                    required
                                />

                                <button
                                    type="submit"
                                    className="auth-button"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Creating Account...' : 'Sign Up'}
                                </button>
                            </form>

                            <p className="switch-text">
                                Already have an account?
                                <button type="button" onClick={handleLoginFlip}>
                                    Log In
                                </button>
                            </p>
                        </div>

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
                            <p>Discover. Read. Research. Connect.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthBook;
