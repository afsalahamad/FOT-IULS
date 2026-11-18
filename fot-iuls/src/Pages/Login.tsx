import './EditProfile.css';

function Login() {
    return (
        <main className="edit-profile-container">
            <section className="edit-profile-card">
                <h2>Login</h2>
                <p className="edit-profile-subtitle">Sign in to IULMS</p>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        window.location.hash = '#home';
                    }}
                >
                    <div className="edit-profile-group">
                        <label htmlFor="login-email">Email Address</label>
                        <input id="login-email" type="email" required />
                    </div>
                    <div className="edit-profile-group">
                        <label htmlFor="login-password">Password</label>
                        <input id="login-password" type="password" required />
                    </div>
                    <div className="edit-profile-buttons">
                        <button type="button" onClick={() => window.location.hash = '#home'}>
                            Cancel
                        </button>
                        <button type="submit">Login</button>
                    </div>
                </form>
            </section>
        </main>
    );
}

export default Login;