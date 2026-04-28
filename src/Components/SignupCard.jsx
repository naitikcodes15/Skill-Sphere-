import React from 'react';
import { getAuth ,GoogleAuthProvider , signInWithPopup } from 'firebase/auth';
import {app} from '../firebase';
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const SignupCard = () => {
    const signupWithGoogle = () =>{
        signInWithPopup(auth,googleProvider);
    }
  return (
    <div className="flex justify-center items-center min-h-screen w-screen bg-[#121212] font-sans">
      <div className="bg-[#181818] p-10 rounded-[20px] shadow-[0_10px_25px_rgba(0,0,0,0.5)] w-full max-w-[400px] text-center border border-[#2a2a2a]">
        <header>
          <h1 className="text-[#e67e22] text-[1.8rem] font-extrabold m-0 tracking-[1px]">ALOO BHUJIYA CODER</h1>
          <p className="text-[#7f8c8d] text-[0.95rem] mt-2 font-medium">Learn • Grow • Enjoy</p>
        </header>

        <div className="h-[1px] bg-[#2a2a2a] my-8"></div>

        <button onClick={signupWithGoogle} className="flex items-center justify-center gap-3 w-full bg-[#ffffff] border border-[#dadce0] text-[#3c4043] p-3 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-[#f7f8f8] hover:shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className="w-5 h-5"
          />
          <span>SignIn with Google</span>
        </button>

        <footer className="mt-6 text-[#bdc3c7] text-[0.8rem]">
          <p>Join the community of snack-loving coders.</p>
        </footer>
      </div>
    </div>
  );
};

export default SignupCard;