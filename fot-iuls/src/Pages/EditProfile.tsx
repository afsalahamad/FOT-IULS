import { useState } from "react";
import logoTransparent from "../assets/logo-transparent.png";
import "./EditProfile.css";

interface EditProfileProps {
    name: string;
    email: string;
    phone: string;
    department: string;
    role?: string;
    onSave: (profile: {
        name: string;
        email: string;
        phone: string;
        department: string;
    }) => Promise<string | null> | void;
    onCancel: () => void;
}

function EditProfile({
    name,
    email,
    phone,
    department,
    role = "student",
    onSave,
    onCancel
}: EditProfileProps) {
    const [formData, setFormData] = useState({
        name,
        email,
        phone,
        department
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        const err = await onSave(formData);
        setSaving(false);
        if (typeof err === "string" && err) {
            setError(err);
        }
    };

    return (
        <div className="edit-profile-container">
            <div className="edit-profile-card">
                <div className="edit-profile-brand">
                    <img src={logoTransparent} alt="IULS Logo" className="edit-profile-logo" />
                    <div>
                        <h2>Edit Profile</h2>
                        <p className="edit-profile-subtitle">
                            Update your personal information · Role: <strong style={{ textTransform: "capitalize" }}>{role}</strong>
                        </p>
                    </div>
                </div>

                {error && (
                    <p role="alert" style={{ color: "#dc2626", fontSize: "13px", marginBottom: "14px" }}>
                        {error}
                    </p>
                )}

                <form onSubmit={(e) => void handleSubmit(e)}>
                    <div className="edit-profile-group">
                        <label htmlFor="profile-name">Full Name</label>
                        <input
                            id="profile-name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="edit-profile-group">
                        <label htmlFor="profile-email">Email Address</label>
                        <input
                            id="profile-email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="edit-profile-group">
                        <label htmlFor="profile-phone">Phone Number</label>
                        <input
                            id="profile-phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="edit-profile-group">
                        <label htmlFor="profile-dept">Department</label>
                        <input
                            id="profile-dept"
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="edit-profile-buttons">
                        <button type="button" onClick={onCancel} disabled={saving}>
                            Cancel
                        </button>

                        <button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProfile;
