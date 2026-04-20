import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProfileButton = ({ className = "" }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <button
      onClick={() => navigate("/profile")}
      className={`flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all ${className}`}
    >
      {/* 👤 Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"
        />
      </svg>
    </button>
  );
};

export default ProfileButton;