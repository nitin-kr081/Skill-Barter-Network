import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createListing } from "../services/listingService";
import { Link , useNavigate} from "react-router-dom";

const MAX_SKILLS = 3;

const parseSkills = (input) =>
  input
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsOffered, setSkillsOffered] = useState("");
  const [skillsWanted, setSkillsWanted] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOfferedChange = (e) => {
    const input = e.target.value;
    const skills = parseSkills(input);
    if (skills.length > MAX_SKILLS) {
      setError(`Limit reached: max ${MAX_SKILLS} offered skills`);
      return;
    }
    setError("");
    setSkillsOffered(input);
  };

  const handleWantedChange = (e) => {
    const input = e.target.value;
    const skills = parseSkills(input);
    if (skills.length > MAX_SKILLS) {
      setError(`Limit reached: max ${MAX_SKILLS} wanted skills`);
      return;
    }
    setError("");
    setSkillsWanted(input);
  };

  const handleCreate = async () => {
    if (!user?.uid) return;
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const offered = parseSkills(skillsOffered);
    const wanted = parseSkills(skillsWanted);

    if (offered.length === 0 || wanted.length === 0) {
      setError("At least one skill for both fields is required");
      return;
    }

    try {
      setLoading(true);
      await createListing({
        title,
        description,
        skillsOffered: offered,
        skillsWanted: wanted,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date().toISOString()
      });

      navigate("/listings");
      setTitle("");
      setDescription("");
      setSkillsOffered("");
      setSkillsWanted("");
    } catch (err) {
      setError("Error creating list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#020617] p-4 font-sans">
      
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full" />
      <div className="absolute top-1/4 right-1/4 w-[250px] h-[250px] bg-cyan-500/10 blur-[80px] rounded-full" />

      {/* Reduced Box Size: max-w-[380px] and smaller padding p-8 */}
      <div className="relative w-full max-w-[380px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 pt-14 shadow-2xl z-10">
        
        {/* Reduced Circular Box: w-20 h-20 (from w-28) */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-[#a855f7] via-[#3b82f6] to-[#2dd4bf] shadow-[0_0_25px_rgba(168,85,247,0.3)]">
          <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center overflow-hidden relative text-white">
            {/* Reduced + Size: w-8 h-8 (from w-12) */}
            <svg viewBox="0 0 24 24" className="w-8 h-8 opacity-90" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          </div>
        </div>

        <h2 className="text-center text-white font-medium text-xl mb-6 tracking-tight">New List</h2>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs text-center">
            {success}
          </div>
        )}

        <div className="space-y-3.5">
          <input
            placeholder="List Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 px-5 text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-500/50 transition-all"
          />

          <textarea
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="2"
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 px-5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/50 transition-all resize-none"
          />

          <div className="space-y-1">
            <label className="text-[9px] text-gray-500 uppercase tracking-widest ml-2">Offered (Max 3)</label>
            <input
              placeholder="React, Design"
              value={skillsOffered}
              onChange={handleOfferedChange}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 px-5 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-gray-500 uppercase tracking-widest ml-2">Wanted (Max 3)</label>
            <input
              placeholder="Python, Rust"
              value={skillsWanted}
              onChange={handleWantedChange}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 px-5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/50 transition-all"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-[#bf80ff] to-[#2dd4bf] text-white font-bold text-base hover:brightness-110 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add"}
          </button>

          <div className="text-center pt-2">
            <Link to="/listings" className="text-gray-500 hover:text-white transition-colors text-xs">
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;