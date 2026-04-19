import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getListings } from "../services/listingService";

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getListings();
        setListings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-cyan-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Marketplace
            </h1>
            <p className="text-gray-500 mt-2">Discover skills to trade and people to grow with.</p>
          </div>
          
          <div className="flex gap-4">
            <Link to="/my-listings">
              <button className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium">
                My Posts
              </button>
            </Link>

            <Link to="/create">
              <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#a855f7] to-[#2dd4bf] text-white font-bold text-sm shadow-[0_10px_20px_rgba(168,85,247,0.2)] hover:brightness-110 active:scale-95 transition-all">
                + Create New
              </button>
            </Link>
          </div>
        </div>

        {/* No listings */}
        {listings.length === 0 && (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-[40px] backdrop-blur-xl">
            <p className="text-gray-500 text-lg">No listings available at the moment.</p>
          </div>
        )}

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-xl hover:border-white/20 transition-all hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {item.title}
                </h3>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                {item.description}
              </p>

              <div className="space-y-4 mb-8">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-cyan-500 font-bold block mb-2">Offering</span>
                  <div className="flex flex-wrap gap-2">
                    {item.skillsOffered?.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-widest text-purple-500 font-bold block mb-2">Wanted</span>
                  <div className="flex flex-wrap gap-2">
                    {item.skillsWanted?.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 truncate">
                  Posted by : {item.userEmail}
                </span>
                {/* <button className="text-xs font-bold text-white hover:text-cyan-400 transition-colors">
                  View Details →
                </button> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Listings;