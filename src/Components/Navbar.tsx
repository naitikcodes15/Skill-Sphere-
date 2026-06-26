import React, { useState, useEffect } from 'react';
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    const [fullName, setFullName] = useState<string>("");

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                // Handle dev bypass user mock
                if (currentUser.uid === "test-user-123") {
                    setFullName("TestAgent");
                    return;
                }
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        setFullName(userDoc.data().name as string);
                    }
                } catch (error) {
                    console.error("Error fetching user name:", error);
                }
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        signOut(auth);
    };

    return (
        <nav className="bg-[#181818] h-[70px] flex items-center shadow-[0_2px_10px_rgba(0,0,0,0.2)] sticky top-0 z-[1000] px-8 border-b border-[#2a2a2a] transition-all duration-300">
            <div className="flex justify-between items-center w-full max-w-[1200px] mx-auto">
                <Link to="/" className="font-extrabold text-2xl text-[#00f2fe] tracking-tighter no-underline hover:text-white transition-colors duration-300 filter drop-shadow-[0_0_8px_rgba(0,242,254,0.2)]">SkillSphere</Link>
                
                <ul className="flex list-none gap-10 max-md:gap-4 max-md:text-sm">
                    <li><Link to="/" className="no-underline text-gray-300 font-semibold text-base transition-all duration-300 hover:text-[#00f2fe] hover:-translate-y-[2px]">Home</Link></li>
                    <li><Link to="/friends" className="no-underline text-gray-300 font-semibold text-base transition-all duration-300 hover:text-[#00f2fe] hover:-translate-y-[2px]">Friends</Link></li>
                    <li><Link to="/games" className="no-underline text-gray-300 font-semibold text-base transition-all duration-300 hover:text-[#00f2fe] hover:-translate-y-[2px]">Games</Link></li>
                    <li><Link to="/quizzes" className="no-underline text-gray-300 font-semibold text-base transition-all duration-300 hover:text-[#00f2fe] hover:-translate-y-[2px]">Quizzes</Link></li>
                </ul>

                <div className="flex items-center gap-5">
                    <Link to="/profile" className="no-underline">
                        <div className="flex items-center gap-2.5 cursor-pointer group">
                            <div className="w-[35px] h-[35px] bg-[#00f2fe] text-black rounded-full flex items-center justify-center font-bold text-base transition-transform duration-300 group-hover:scale-110">
                                {fullName ? fullName.charAt(0).toUpperCase() : "?"}
                            </div>
                            <span className="text-gray-200 font-semibold text-[0.95rem] max-md:hidden group-hover:text-white transition-colors duration-300">{fullName || "User"}</span>
                        </div>
                    </Link>

                    <button onClick={handleLogout} className="bg-[#00f2fe] text-black border-none py-2 px-5 rounded-lg font-semibold cursor-pointer transition-all duration-300 hover:bg-[#00c2cb] hover:shadow-[0_0_10px_#00f2fe]">Logout</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
