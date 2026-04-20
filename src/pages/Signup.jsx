import { useState } from 'react';
import { signup } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Please fill all fields");
      return;
    }
    try {
      await signup(email, password);
      navigate("/dashboard");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        alert("Email already in use");
      } else if (err.code === "auth/invalid-email") {
        alert("Invalid email format");
      } else if (err.code === "auth/weak-password") {
        alert("Password should be at least 6 characters");
      } else {
        alert("Something went wrong");
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#020617] p-4 font-sans">
      
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full" />

      {/* Glassmorphic Card */}
      <div className="relative w-full max-w-[400px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 pt-20 shadow-2xl z-10">
        
        {/* Updated Avatar Container: Added Spaced + and Stretched Arrow */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full p-[3px] bg-gradient-to-tr from-[#2dd4bf] via-[#3b82f6] to-[#a855f7] shadow-[0_0_30px_rgba(45,212,191,0.3)]">
          <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center overflow-hidden relative">
            <svg viewBox="0 0 24 24" className="w-14 h-14 text-white/90" fill="currentColor">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          </div>
        </div>

        <h2 className="text-center text-white font-medium text-2xl mb-10 tracking-tight">Create Account</h2>

        <form onSubmit={handleSignUp} className="space-y-5">
          <div className="relative">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-gray-500 outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input with Eye-Line Icons */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create Password"
              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-gray-500 outline-none focus:border-purple-500/50 focus:bg-white/[0.08] transition-all pr-16"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-[#2dd4bf] to-[#a855f7] text-white font-bold text-lg hover:brightness-110 transition-all transform active:scale-[0.98] shadow-[0_10px_20px_rgba(45,212,191,0.2)]"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-10 text-center text-gray-500 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-300 hover:text-white transition-colors border-b border-gray-700 hover:border-white pb-0.5">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;



// import {useState} from 'react';
// import {signup} from '../services/authService';
// import {useNavigate} from 'react-router-dom';
// import { Link } from "react-router-dom";
// import openEyeIcon from "../icons/5561547.png";
// import closedEyeIcon from "../icons/7235809.png";

// const Signup = () => {
//     const[email , setEmail] = useState("");
//     const[password , setPassword] = useState("");
//     const[showPassword, setShowPassword] = useState(false);
//     const navigate = useNavigate();

//     const handleSignUp = async () => {
//         if(!email.trim() || !password.trim()){
//             alert("Please fill all fields");
//             return;
//         }
//         try{
//             await signup(email,password);
//             alert("Successfully Signed Up");
//             navigate('/');
//         } catch(err){
//             if(err.code === "auth/email-already-in-use"){
//                 alert("Email already in use");
//             }else if (err.code === "auth/invalid-email") {
//                 alert("Invalid email format");
//             }else if(err.code === "auth/weak-password"){
//                 alert("Password should be atleast 6 characters");
//             }else{
//                 alert("Something went wrong");
//             }
//         }
//     };

//     return (
//         <div>
//             <input
//                 type="email"
//                 placeholder="Email"
//                 onChange={(e) => setEmail(e.target.value)}
//             />
//             <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Password"
//                 onChange={(e) => setPassword(e.target.value)}
//             />
//             <button onClick={() => setshowPassword(!showPassword)}>
//                 <img
//                 src={showPassword ? closedEyeIcon : openEyeIcon}/>
//             </button>
//             <button onClick={handleSignUp}>
//                 SignUp
//             </button>
//             <p>
//                 Already have an account?{" "}
//                 <Link to="/login">
//                     Login
//                 </Link>
//             </p>
//         </div>
//     )
// };
// export default Signup;