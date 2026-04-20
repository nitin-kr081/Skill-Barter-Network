import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#020617] text-white font-sans flex flex-col">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[min(90vw,520px)] h-[min(90vw,520px)] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-cyan-500/10 blur-[100px] rounded-full" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 max-w-6xl mx-auto w-full">
        <span className="text-sm font-semibold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          Skill Barter
        </span>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium hover:bg-white/10 transition-all"
              >
                Dashboard
              </Link>
              <Link
                to="/listings"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#2dd4bf] text-sm font-bold hover:brightness-110 transition-all"
              >
                Marketplace
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl border border-white/10 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#2dd4bf] text-sm font-bold hover:brightness-110 transition-all"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-24 text-center max-w-2xl mx-auto w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-400/90 font-semibold mb-4">
          Trade skills, not cash
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
          Swap what you know for what you need
        </h1>
        <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-10">
          Post what you offer and what you want. Browse a live marketplace, spot matches, and reach out to other members in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          {user ? (
            <>
              <Link
                to="/listings"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#a855f7] to-[#2dd4bf] font-bold text-base hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(168,85,247,0.25)]"
              >
                Open marketplace
              </Link>
              <Link
                to="/create"
                className="px-8 py-4 rounded-2xl border border-white/15 bg-white/5 font-semibold text-base hover:bg-white/10 transition-all"
              >
                Create a listing
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#2dd4bf] to-[#a855f7] font-bold text-base hover:brightness-110 active:scale-[0.98] transition-all"
              >
                Get started
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl border border-white/15 bg-white/5 font-semibold text-base hover:bg-white/10 transition-all"
              >
                I have an account
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
