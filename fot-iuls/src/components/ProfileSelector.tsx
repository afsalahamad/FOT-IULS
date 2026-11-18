
import "./ProfileSelector.css";

interface ProfileSelectorProps {
    name: string;
    onClick: () => void;
}

function ProfileSelector({ name, onClick }: ProfileSelectorProps) {
    return (
        <button
            className="profile-selector"
            type="button"
            onClick={onClick}
            aria-label={`Open ${name} profile menu`}
        >
            <div className="selector-avatar">
                {name.charAt(0).toUpperCase()}
            </div>

            <span>{name}</span>
        </button>
    );
}

export default ProfileSelector;
