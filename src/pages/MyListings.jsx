import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { deleteListing } from "../services/listingService";
import { Link } from "react-router-dom";

const MyListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State to track which listing is being deleted
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);

    const q = query(
      collection(db, "listings"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListings(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const executeDelete = async () => {
    if (!deleteId) return;
    
    try {
      setIsDeleting(true);
      await deleteListing(deleteId);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      alert("Error deleting list");
    } finally {
      setIsDeleting(false);
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
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-purple-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-cyan-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-10 pb-6 border-b border-white/5">
          <div>
            <div className="flex flex-wrap gap-3 mb-2">
              <Link
                to="/dashboard"
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                ← Dashboard
              </Link>
              <Link
                to="/listings"
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Marketplace
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and track your active skill-swap posts.</p>
          </div>
          <Link to="/create">
            <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium">
              + New Post
            </button>
          </Link>
        </div>

        {listings.length === 0 && (
          <div className="text-center py-24 bg-white/[0.02] border border-white/5 rounded-[32px] backdrop-blur-xl">
            <p className="text-gray-500 italic">You haven't posted any lists yet.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[28px] p-7 shadow-xl transition-all hover:border-white/20"
            >
              <button 
                onClick={() => setDeleteId(item.id)}
                className="absolute top-5 right-5 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <div className="pr-10">
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-6 line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-cyan-500 font-bold block mb-1.5 ml-1">Offering</span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.skillsOffered?.map((skill, i) => (
                      <span key={i} className="px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-purple-500 font-bold block mb-1.5 ml-1">Wanted</span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.skillsWanted?.map((skill, i) => (
                      <span key={i} className="px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Glassmorphic Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isDeleting && setDeleteId(null)}
          />
          
          <div className="relative w-full max-w-[340px] bg-[#0f172a] border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-500/20 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-white font-bold text-xl mb-2">Remove List?</h3>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                This action is permanent and will remove your post from the marketplace.
              </p>

              <div className="flex gap-3">
                <button
                  disabled={isDeleting}
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={executeDelete}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 flex items-center justify-center"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListings;