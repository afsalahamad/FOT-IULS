
import "./ProfileSelector.css";

interface ProfileSelectorProps {
    name: string;
    onClick: () => void;
}

function ProfileSelector({ name, onClick }: ProfileSelectorProps) {
    return (
        <button className="profile-selector" onClick={onClick}>
            <div className="selector-avatar">
                {name.charAt(0).toUpperCase()}
            </div>

            <span>{name}</span>
        </button>
    );
}

export default ProfileSelector;
