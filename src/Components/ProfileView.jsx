import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const ProfileView = ({ data, userId, onEdit }) => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (data) {
                setUserData(data);
                return;
            }
            if (userId) {
                try {
                    const userDoc = await getDoc(doc(db, "users", userId));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            }
        };
        fetchProfile();
    }, [userId, data]);

    if (!userData) return <div className="text-[#94a3b8] p-5 text-center w-[340px] border-l border-[#1f2023] bg-[#2b2d31]">Loading Profile...</div>;

    return (
        <aside className="w-full max-w-[340px] md:min-w-[340px] bg-[#2b2d31] flex flex-col shrink-0 border-l border-[#1f2023] overflow-y-auto text-[#dcddde] mx-auto md:mx-0">
            <div className="h-[120px] bg-[#5865f2] w-full shrink-0"></div>
            <div className="px-4 relative pb-4 text-left">
                <div className="absolute -top-[50px] w-[92px] h-[92px] rounded-full bg-[#2b2d31] p-1.5 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-[#1e1f22] text-[#e67e22] flex items-center justify-center text-[2rem] font-bold">
                        {(userData.name || userData.username || "?").charAt(0).toUpperCase()}
                    </div>
                </div>
                
                <div className="bg-[#111214] rounded-lg mt-[65px] p-4 flex flex-col shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                    <h2 className="m-0 text-xl text-[#f2f3f5] font-bold">{userData.name || "User Name"}</h2>
                    <p className="m-0 text-sm text-[#dbdee1] opacity-90 mt-1">@{userData.username || "username"}</p>
                    
                    {userData.degree && (
                        <p className="m-0 text-[13px] italic text-[#dcddde] mt-1">{userData.degree} in {userData.branch}</p>
                    )}
                    
                    <div className="w-full h-px bg-[#2b2d31] my-4"></div>

                    <div className="flex flex-col gap-1 mb-4">
                        <h3 className="m-0 text-xs font-bold text-[#e67e22] uppercase tracking-[1px] mb-2 border-b border-[#2b2d31] pb-1">Personal Details</h3>
                        <p className="m-0 text-sm"><strong>Age:</strong> {userData.age || "N/A"}</p>
                        <p className="m-0 text-sm"><strong>Home City:</strong> {userData.homeCity || "N/A"}</p>
                    </div>

                    <div className="flex flex-col gap-1 mb-4">
                        <h3 className="m-0 text-xs font-bold text-[#e67e22] uppercase tracking-[1px] mb-2 border-b border-[#2b2d31] pb-1">Education</h3>
                        <p className="m-0 text-sm"><strong>College:</strong> {userData.collegeName || "N/A"}</p>
                        <p className="m-0 text-sm"><strong>Year:</strong> {userData.year || "N/A"}</p>
                    </div>

                    <div className="flex flex-col gap-1 mb-4">
                        <h3 className="m-0 text-xs font-bold text-[#e67e22] uppercase tracking-[1px] mb-2 border-b border-[#2b2d31] pb-1">About Campus</h3>
                        <p className="m-0 text-sm italic text-[#94a3b8] leading-relaxed">{userData.about || "No details provided."}</p>
                    </div>

                    {onEdit && (
                        <button className="w-full mt-2 p-3 bg-transparent border-2 border-[#e67e22] text-[#e67e22] font-bold rounded-lg cursor-pointer transition-all duration-300 hover:bg-[#e67e22] hover:text-white" onClick={onEdit}>
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default ProfileView;