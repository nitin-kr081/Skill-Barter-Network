import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      alert("Logged in!");
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert("Error logging in");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#020617] p-4 font-sans">
      
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full" />

      {/* Glassmorphic Card */}
      <div className="relative w-full max-w-[400px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 pt-20 shadow-2xl z-10">
        
        {/* Avatar Container with Spaced Arrow */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full p-[3px] bg-gradient-to-tr from-[#a855f7] via-[#3b82f6] to-[#2dd4bf] shadow-[0_0_30px_rgba(168,85,247,0.4)]">
          <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center overflow-hidden relative">
            <svg viewBox="0 0 24 24" className="w-14 h-14 text-white/90" fill="currentColor">
              {/* User Silhouette (shifted left slightly more) */}
              <path d="M9 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              {/* Spaced Right Arrow (shifted right to create gap) */}
              <path d="M23 12l-4-4v3h-4v2h4v3l4-4z" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          </div>
        </div>

        <h2 className="text-center text-white font-medium text-2xl mb-10 tracking-tight">Sign in</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-gray-500 outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input with Eye Icons */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-gray-500 outline-none focus:border-purple-500/50 focus:bg-white/[0.08] transition-all pr-16"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                // Eye-Line Icon (Visible State)
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              ) : (
                // Closed Eye-Line Icon (Hidden State)
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              )}
            </button>
          </div>

          {/* Gradient Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-[#bf80ff] to-[#2dd4bf] text-white font-bold text-lg hover:brightness-110 transition-all transform active:scale-[0.98] shadow-[0_10px_20px_rgba(168,85,247,0.3)]"
          >
            Sign In
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-10 text-center text-gray-500 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-gray-300 hover:text-white transition-colors border-b border-gray-700 hover:border-white pb-0.5">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;


// import { useState} from "react";
// import {useNavigate} from 'react-router-dom';
// import { login } from "../services/authService";
// import { Link } from "react-router-dom";
// import openEyeIcon from "../icons/5561547.png";
// import closedEyeIcon from "../icons/7235809.png";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const[showPassword, setshowPassword] = useState(false);
//   const navigate = useNavigate();


//   const handleLogin = async () => {
//     try {
//       await login(email, password);
//       alert("Logged in!");
//       navigate('/dashboard')
//     } catch (err) {
//       console.error(err);
//       alert("Error logging in");
//     }
//   };

//   return (
//     <div className="p-4">
//       <input
//         placeholder="Email"
//         onChange={(e) => setEmail(e.target.value)}
//       />
//       <input
//         type={showPassword ? "text" : "password"}
//         placeholder="Password"
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <button onClick={() => setshowPassword(!showPassword)}>
//         <img src={showPassword ? closedEyeIcon : openEyeIcon}/>
//       </button>
//       <button className="bg-blue-500 text-white p-2" onClick={handleLogin}>
//         Login
//       </button>
//       <p>
//         Don't have an account?{" "}
//         <Link to="/signup">
//           Signup
//         </Link>
//       </p>
//     </div>
//   );
// };

// export default Login;
