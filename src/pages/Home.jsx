import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileButton from "../components/ProfileButton";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 md:px-12 font-sans">

      {/* 🔥 TOP RIGHT PROFILE */}
      <div className="flex justify-end pt-6">
        <ProfileButton />
      </div>

      {/* 🔥 HERO SECTION */}
      <div className="text-center py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          Skill Barter Network
        </h1>

        <p className="text-gray-400 max-w-xl mx-auto text-lg">
          Exchange skills instead of money. Connect with people,
          trade knowledge, and grow together.
        </p>

        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Link
            to={user ? "/listings" : "/login"}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 transition-all"
          >
            Explore Listings
          </Link>

        </div>
      </div>

      {/* 🔥 HOW IT WORKS */}
      <div className="py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          How it works
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">

          <div className="p-6 border border-white/10 rounded-2xl bg-white/[0.02]">
            <h3 className="font-semibold mb-2 text-lg">1. Create Listing</h3>
            <p className="text-gray-400 text-sm">
              Offer a skill and specify what you want in return.
            </p>
          </div>

          <div className="p-6 border border-white/10 rounded-2xl bg-white/[0.02]">
            <h3 className="font-semibold mb-2 text-lg">2. Send Requests</h3>
            <p className="text-gray-400 text-sm">
              Find matches and request skill exchanges with others.
            </p>
          </div>

          <div className="p-6 border border-white/10 rounded-2xl bg-white/[0.02]">
            <h3 className="font-semibold mb-2 text-lg">3. Chat & Review</h3>
            <p className="text-gray-400 text-sm">
              Communicate, complete trades, and build trust through reviews.
            </p>
          </div>

        </div>
      </div>

      {/* 🔥 FEATURES */}
      <div className="py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Key Features
        </h2>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">

          <div className="p-5 border border-white/10 rounded-2xl bg-white/[0.02]">
            Real-time chat powered by Firebase
          </div>

          <div className="p-5 border border-white/10 rounded-2xl bg-white/[0.02]">
            Skill-based matching system
          </div>

          <div className="p-5 border border-white/10 rounded-2xl bg-white/[0.02]">
            Dual-user review & trust system
          </div>

          <div className="p-5 border border-white/10 rounded-2xl bg-white/[0.02]">
            Live request and trade tracking
          </div>

        </div>
      </div>

      {/* 🔥 CTA */}
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold mb-4">
          Start trading your skills today
        </h2>

        <Link
          to={user ? "/dashboard" : "/signup"}
          className="inline-block mt-4 px-8 py-3 bg-gradient-to-r from-[#a855f7] to-[#2dd4bf] rounded-xl font-medium hover:brightness-110 transition-all"
        >
          {user ? "Go to Dashboard" : "Get Started"}
        </Link>
      </div>

    </div>
  );
};

export default Home;