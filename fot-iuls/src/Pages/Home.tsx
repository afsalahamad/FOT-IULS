
import { useState } from "react";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import EditProfile from "./EditProfile";

function Home() {

    const [isEditing, setIsEditing] = useState(false);

    const [profile, setProfile] = useState({
        name: "Afsal Ahamad",
        email: "afsal@example.com",
        phone: "0771234567",
        department: "Information and Communication Technology"
    });

    return (
        <div>

            <Navigation
                name={profile.name}
                onEditProfile={() => setIsEditing(true)}
            />

            <main>
                {isEditing ? (
                    <EditProfile
                        {...profile}
                        onSave={(updatedProfile) => {
                            setProfile(updatedProfile);
                            setIsEditing(false);
                        }}
                        onCancel={() => setIsEditing(false)}
                    />
                ) : (
                    <div>
                        {/* Your Home Page Content */}
                        <h1>Welcome to IULMS</h1>
                    </div>
                )}
            </main>

            <Footer />

        </div>
    );
}

export default Home;
