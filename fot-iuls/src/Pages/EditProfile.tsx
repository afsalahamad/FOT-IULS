
import { useState } from "react";
import "./EditProfile.css";

interface EditProfileProps {
    name: string;
    email: string;
    phone: string;
    department: string;
    onSave: (profile: {
        name: string;
        email: string;
        phone: string;
        department: string;
    }) => void;
    onCancel: () => void;
}

function EditProfile({
    name,
    email,
    phone,
    department,
    onSave,
    onCancel
}: EditProfileProps) {

    const [formData, setFormData] = useState({
        name,
        email,
        phone,
        department
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="edit-profile-container">
            <div className="edit-profile-card">

                <h2>Edit Profile</h2>
                <p className="edit-profile-subtitle">
                    Update your personal information
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="edit-profile-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="edit-profile-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="edit-profile-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="edit-profile-group">
                        <label>Department</label>
                        <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="edit-profile-buttons">
                        <button type="button" onClick={onCancel}>
                            Cancel
                        </button>

                        <button type="submit">
                            Save Changes
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default EditProfile;
