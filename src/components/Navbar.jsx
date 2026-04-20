import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/authService";
import ProfileButton from "./ProfileButton";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="w-full border-b border-white/10 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* 🔥 LEFT - LOGO */}
        <Link to="/" className="text-lg font-bold tracking-tight">
          SkillBarter
        </Link>

        {/* 🔥 CENTER - NAV LINKS */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <Link to="/listings" className="hover:text-white">
            Marketplace
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className="hover:text-white">
                Dashboard
              </Link>
              <Link to="/my-requests" className="hover:text-white">
                Trades
              </Link>
            </>
          )}
        </div>

        {/* 🔥 RIGHT */}
        <div className="flex items-center gap-4">

          {!user ? (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-300 hover:text-white"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="px-4 py-2 rounded-lg bg-cyan-500 text-sm"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              <ProfileButton />

              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white"
              >
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;