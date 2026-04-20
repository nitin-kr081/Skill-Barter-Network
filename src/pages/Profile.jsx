import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from 'react-router-dom';
import TrustBadge from "../components/TrustBadge";
import { useReviewSummaries } from "../hooks/useReviewSummaries";
import { saveUserProfile, getUserProfile } from "../services/userService";
import { logout } from "../services/authService";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [skillsOffered, setSkillsOffered] = useState("");
  const [skillsWanted, setSkillsWanted] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { summaries, loading: trustLoading } = useReviewSummaries(
    user?.uid ? [user.uid] : []
  );

  const displayName = user?.displayName || (user?.email ? user.email.split("@")[0] : "User");
  const avatarUrl = user?.photoURL || null;
  const avatarFallback = displayName?.charAt(0)?.toUpperCase() || "U";

  const handleLogout = async() => {
    try {
      await logout();
      navigate('/login');
    } catch(err) {
      console.error(err.code, err.message);
    }
  };

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile(user.uid);
        if (data) {
          setName(data.name || "");
          setSkillsOffered((data.skillsOffered || []).join(", "));
          setSkillsWanted((data.skillsWanted || []).join(", "));
        }
      } catch (err) {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user?.uid) return;
    setError("");
    setSuccess("");

    if (!name.trim() || !skillsOffered.trim() || !skillsWanted.trim()) {
      setError("All fields are required to complete your profile.");
      return;
    }
    try {
      setSaving(true);
      await saveUserProfile(user.uid, {
        name,
        email: user.email || "",
        skillsOffered: skillsOffered
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
        skillsWanted: skillsWanted
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
      });
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError("Error saving profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-cyan-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-white/5">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#a855f7] to-[#2dd4bf] p-[2px] shadow-2xl transition-transform group-hover:scale-105">
                <div className="w-full h-full rounded-[22px] bg-[#0f172a] flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                      {avatarFallback}
                    </span>
                  )}
                </div>
              </div>
              <button className="absolute -bottom-2 -right-2 bg-white text-black p-2 rounded-xl shadow-lg hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">{name || displayName}</h1>
              <p className="text-gray-500">{user?.email}</p>
              <TrustBadge
                summary={summaries?.[user?.uid]}
                loading={trustLoading}
                className="mt-3"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard"
              className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Instructions */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-2">Profile Details</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Update your personal information and expertise. This helps other community members find you based on the skills you offer and want to learn.
            </p>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-xl">
              
              {/* Status Messages */}
              {error && <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
              {success && <div className="mb-6 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm">{success}</div>}

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. John Doe"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 px-6 focus:border-cyan-500/50 focus:bg-white/[0.08] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Skills Offered</label>
                  <textarea
                    rows="2"
                    value={skillsOffered}
                    onChange={(e) => setSkillsOffered(e.target.value)}
                    placeholder="React, Design, Copywriting..."
                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 px-6 focus:border-purple-500/50 focus:bg-white/[0.08] outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Skills Wanted</label>
                  <textarea
                    rows="2"
                    value={skillsWanted}
                    onChange={(e) => setSkillsWanted(e.target.value)}
                    placeholder="Python, Public Speaking..."
                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 px-6 focus:border-cyan-500/50 focus:bg-white/[0.08] outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between">
                  {/* <Link to="/dashboard" className="text-sm text-gray-500 hover:text-white transition-colors">
                    Cancel
                  </Link> */}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-4 bg-gradient-to-r from-[#a855f7] to-[#2dd4bf] rounded-2xl font-bold shadow-[0_10px_20px_rgba(168,85,247,0.3)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {saving ? "Saving Changes..." : "Save Profile"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;