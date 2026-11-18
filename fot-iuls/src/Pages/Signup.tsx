import './EditProfile.css';

function Signup() {
    return (
        <main className="edit-profile-container">
            <section className="edit-profile-card">
                <h2>Create Account</h2>
                <p className="edit-profile-subtitle">Join IULMS</p>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        window.location.hash = '#home';
                    }}
                >
                    <div className="edit-profile-group">
                        <label htmlFor="signup-name">Full Name</label>
                        <input id="signup-name" type="text" required />
                    </div>
                    <div className="edit-profile-group">
                        <label htmlFor="signup-email">Email Address</label>
                        <input id="signup-email" type="email" required />
                    </div>
                    <div className="edit-profile-group">
                        <label htmlFor="signup-password">Password</label>
                        <input id="signup-password" type="password" minLength={8} required />
                    </div>
                    <div className="edit-profile-buttons">
                        <button type="button" onClick={() => window.location.hash = '#home'}>
                            Cancel
                        </button>
                        <button type="submit">Sign Up</button>
                    </div>
                </form>
            </section>
        </main>
    );
}

export default Signup;